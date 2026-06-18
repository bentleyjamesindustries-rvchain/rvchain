'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import WalletOnboarding from '@/components/WalletOnboarding';
import { supabase } from '@/lib/supabaseClient';

export default function WalletPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  return (
    <div className="min-h-screen text-slate-200">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to rvchain
        </Link>
        <WalletOnboarding userId={userId} embedded />
      </div>
    </div>
  );
}