'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard'; import AppShell from '@/components/AppShell'; import { getSupabase } from '@/lib/supabase';

export default function TransactionsPage(){const [rows,setRows]=useState<any[]>([]); useEffect(()=>{(async()=>{const {data}=await getSupabase().from('transactions').select('*,item:items(code,name,unit),profile:profiles(full_name)').order('created_at',{ascending:false}).limit(100);setRows(data||[])})();},[]);return <AuthGuard adminOnly><AppShell admin><div className="page-head"><div><p className="eyebrow">Admin</p><h1>Transaksi Keluar</h1></div></div><div className="transaction-list">{rows.map(r=><article key={r.id}><div><strong>{r.item?.name}</strong><span>{r.item?.code} · {r.quantity} {r.item?.unit||''}</span></div><div className="tx-right"><strong>{r.profile?.full_name||'Staff'}</strong><span>{new Date(r.created_at).toLocaleString('ms-MY')}</span>{r.project&&<em>{r.project}</em>}</div></article>)}{rows.length===0&&<div className="empty"><p>Belum ada transaksi.</p></div>}</div></AppShell></AuthGuard>}
