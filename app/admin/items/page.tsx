'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import AuthGuard from '@/components/AuthGuard'; import AppShell from '@/components/AppShell'; import { getSupabase } from '@/lib/supabase';

export default function ItemsPage(){const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true); const app=process.env.NEXT_PUBLIC_APP_URL||'';
useEffect(()=>{(async()=>{const {data}=await getSupabase().from('items').select('*,department:departments(name),category:categories(name)').order('created_at',{ascending:false});setItems(data||[]);setLoading(false)})();},[]);
return <AuthGuard adminOnly><AppShell admin><div className="page-head"><div><p className="eyebrow">Admin</p><h1>Stok</h1></div><Link className="small-btn" href="/admin/items/new">+ Daftar</Link></div>{loading?<div className="center"><div className="spinner"/></div>:items.length===0?<div className="empty"><h2>Belum ada stok</h2><p>Daftar item pertama untuk menjana QR.</p></div>:<div className="item-list">{items.map(i=><article className="item-row" key={i.id}><div className="qr-mini"><QRCodeSVG value={`${app}/item/${i.id}`} size={62}/></div><div className="grow"><strong>{i.name}</strong><span>{i.code} · {i.department?.name} · {i.category?.name}</span><span>{i.tracking_mode==='quantity'?`${i.current_quantity} ${i.unit||''}`:(i.attributes?.Berat||i.attributes?.['Panjang roll']||'1 unit')}</span></div><span className={'status '+(i.status==='IN_STOCK'?'ok':'muted')}>{i.status==='IN_STOCK'?'Dalam Stor':'Keluar'}</span></article>)}</div>}</AppShell></AuthGuard>}
