'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Boxes, LayoutDashboard, LogOut, QrCode, ReceiptText, PlusCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function AppShell({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/scan', label: 'Scan', icon: QrCode },
    ...(admin ? [
      { href: '/admin/items', label: 'Stok', icon: Boxes },
      { href: '/admin/items/new', label: 'Daftar', icon: PlusCircle },
      { href: '/admin/transactions', label: 'Transaksi', icon: ReceiptText },
    ] : []),
  ];
  const logout = async () => { await getSupabase().auth.signOut(); router.replace('/'); };

  return <div className="app-shell">
    <header className="topbar"><div><strong>IRSYAD</strong><span>Stock Control</span></div><button className="icon-btn" onClick={logout} aria-label="Log keluar"><LogOut size={20}/></button></header>
    <main className="content">{children}</main>
    <nav className="bottom-nav">{links.map(({href,label,icon:Icon}) => <Link key={href} className={path === href ? 'active' : ''} href={href}><Icon size={20}/><span>{label}</span></Link>)}</nav>
  </div>;
}
