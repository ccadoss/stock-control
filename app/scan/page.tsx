'use client';

import { FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import QRScanner from '@/components/QRScanner';

export default function ScanPage() {
  const router = useRouter(); const [code,setCode]=useState('');
  const open = useCallback((raw:string)=>{try{const u=new URL(raw); const m=u.pathname.match(/\/item\/([^/]+)/); if(m) return router.push('/item/'+m[1]);}catch{} router.push('/item/'+encodeURIComponent(raw.trim()));},[router]);
  const submit=(e:FormEvent)=>{e.preventDefault(); if(code.trim()) open(code);};
  return <AuthGuard><AppShell><div className="page-head"><div><p className="eyebrow">Keluaran Stor</p><h1>Scan QR</h1></div></div><QRScanner onScan={open}/><div className="divider"><span>atau</span></div><form onSubmit={submit} className="inline-form"><input placeholder="Masukkan kod item" value={code} onChange={e=>setCode(e.target.value)}/><button className="primary">Buka</button></form></AppShell></AuthGuard>;
}
