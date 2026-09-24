'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
  const [error,setError] = useState(''); const [loading,setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/dashboard');
    } catch (e) { setError(e instanceof Error ? e.message : 'Log masuk gagal.'); }
    finally { setLoading(false); }
  };
  return <main className="login-wrap"><section className="login-card">
    <div className="brand-mark">I</div><h1>Irsyad</h1><p>QR Stock Control</p>
    <form onSubmit={submit} className="form"><label>E-mel<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Kata laluan<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} /></label>{error && <div className="error-box">{error}</div>}<button className="primary" disabled={loading}>{loading ? 'Memproses…' : 'Log Masuk'}</button></form>
  </section></main>;
}
