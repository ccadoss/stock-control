'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import { getSupabase } from '@/lib/supabase';
import { ScanLine } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats,setStats] = useState({ inStock:0,out:0,sublimation:0,sewing:0 });
  const [admin,setAdmin] = useState(false);
  useEffect(()=>{(async()=>{const s=getSupabase(); const {data:{user}}=await s.auth.getUser(); if(user){const {data:p}=await s.from('profiles').select('role').eq('id',user.id).single(); setAdmin(p?.role==='admin');} const {data:items}=await s.from('items').select('status,department:departments(name)'); const rows=(items||[]) as any[]; setStats({inStock:rows.filter(x=>x.status==='IN_STOCK').length,out:rows.filter(x=>x.status==='OUT').length,sublimation:rows.filter(x=>x.department?.name==='Sublimation'&&x.status==='IN_STOCK').length,sewing:rows.filter(x=>x.department?.name==='Sewing'&&x.status==='IN_STOCK').length});})();},[]);
  return <AuthGuard><AppShell admin={admin}><div className="page-head"><div><p className="eyebrow">Ringkasan</p><h1>Stok Semasa</h1></div></div><div className="stats-grid"><article><span>Dalam Stor</span><strong>{stats.inStock}</strong></article><article><span>Keluar</span><strong>{stats.out}</strong></article><article><span>Sublimation</span><strong>{stats.sublimation}</strong></article><article><span>Sewing</span><strong>{stats.sewing}</strong></article></div><Link href="/scan" className="scan-cta"><ScanLine size={28}/><div><strong>Scan Material</strong><span>Imbas QR untuk keluarkan stok</span></div></Link></AppShell></AuthGuard>;
}
