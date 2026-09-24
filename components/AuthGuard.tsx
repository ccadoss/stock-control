'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

export default function AuthGuard({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.replace('/');
        const { data } = await supabase.from('profiles').select('id,full_name,role').eq('id', user.id).single();
        if (!data) return router.replace('/');
        if (adminOnly && data.role !== 'admin') return router.replace('/dashboard');
        setProfile(data as Profile);
      } finally { setLoading(false); }
    };
    run();
  }, [adminOnly, router]);

  if (loading) return <main className="center"><div className="spinner" /></main>;
  if (!profile) return null;
  return <>{children}</>;
}
