-- Irsyad Stock Control - initial schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('admin','staff')),
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  tracking_mode text not null check (tracking_mode in ('unit','quantity')),
  default_unit text,
  unique(department_id,name)
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  department_id uuid not null references public.departments(id),
  category_id uuid not null references public.categories(id),
  tracking_mode text not null check (tracking_mode in ('unit','quantity')),
  status text not null default 'IN_STOCK' check (status in ('IN_STOCK','OUT')),
  unit text,
  initial_quantity numeric not null default 1 check (initial_quantity > 0),
  current_quantity numeric not null default 1 check (current_quantity >= 0),
  attributes jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id),
  transaction_type text not null default 'OUT' check (transaction_type = 'OUT'),
  quantity numeric not null check (quantity > 0),
  project text,
  performed_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, full_name, role) values(new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), 'staff') on conflict do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

create or replace function public.checkout_item(p_item_id uuid, p_quantity numeric default 1, p_project text default null)
returns void language plpgsql security definer set search_path=public as $$
declare v_item public.items;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into v_item from public.items where id=p_item_id for update;
  if not found then raise exception 'Item not found'; end if;
  if v_item.status <> 'IN_STOCK' then raise exception 'Item has already been checked out'; end if;

  if v_item.tracking_mode='unit' then
    if p_quantity <> 1 then raise exception 'Unit item quantity must be 1'; end if;
    update public.items set current_quantity=0,status='OUT',updated_at=now() where id=p_item_id;
    insert into public.transactions(item_id,quantity,project,performed_by) values(p_item_id,1,nullif(trim(p_project),''),auth.uid());
  else
    if p_quantity <= 0 or p_quantity > v_item.current_quantity then raise exception 'Invalid quantity'; end if;
    update public.items set current_quantity=current_quantity-p_quantity,
      status=case when current_quantity-p_quantity=0 then 'OUT' else 'IN_STOCK' end, updated_at=now() where id=p_item_id;
    insert into public.transactions(item_id,quantity,project,performed_by) values(p_item_id,p_quantity,nullif(trim(p_project),''),auth.uid());
  end if;
end; $$;

grant execute on function public.checkout_item(uuid,numeric,text) to authenticated;

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.transactions enable row level security;

create policy "profiles own or admin read" on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy "departments authenticated read" on public.departments for select to authenticated using(true);
create policy "categories authenticated read" on public.categories for select to authenticated using(true);
create policy "items authenticated read" on public.items for select to authenticated using(true);
create policy "items admin insert" on public.items for insert to authenticated with check(public.is_admin());
create policy "items admin update" on public.items for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "items admin delete" on public.items for delete to authenticated using(public.is_admin());
create policy "transactions own or admin read" on public.transactions for select to authenticated using(performed_by=auth.uid() or public.is_admin());

insert into public.departments(name) values ('Sublimation'),('Sewing') on conflict do nothing;
insert into public.categories(department_id,name,tracking_mode,default_unit)
select d.id,x.name,x.mode,x.unit from public.departments d join (values
 ('Sublimation','Fabric','unit','roll'),('Sublimation','Paper','unit','roll'),('Sublimation','Ink','unit','bottle'),
 ('Sewing','Thread','unit','cone'),('Sewing','Collar','quantity','pcs')
) as x(dept,name,mode,unit) on d.name=x.dept on conflict do nothing;

-- After creating the first account in Supabase Auth, promote it manually once:
-- update public.profiles set role='admin' where id='<AUTH_USER_UUID>';
