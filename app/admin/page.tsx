'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { isModerator } from '@/lib/moderator';
import {
  adminSetListingFeatured,
  adminSetSellerPro,
  fetchActiveListings,
  MarketListing,
} from '@/lib/marketListings';

export default function AdminPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [sellerUserId, setSellerUserId] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user;
    if (u) setUser({ id: u.id, email: u.email || undefined });
    else setUser(null);
    const { listings: rows } = await fetchActiveListings({});
    setListings(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const allowed = isModerator(user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-slate-300">Sign in on the main app, then return here.</p>
        <Link href="/" className="text-amber-400 font-semibold">
          ← rvchain home
        </Link>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-slate-300">Admin access requires a moderator email.</p>
        <p className="text-xs text-slate-500 max-w-sm">
          Set NEXT_PUBLIC_MODERATOR_EMAILS in env (comma-separated). When empty, any signed-in user
          can moderate in MVP mode.
        </p>
        <Link href="/" className="text-amber-400 font-semibold">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin</h1>
          <p className="text-xs text-slate-500">Featured listings &amp; Seller Pro flags</p>
        </div>
        <Link href="/" className="text-sm text-amber-400">
          ← App
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <h2 className="font-semibold text-white">Grant Seller Pro</h2>
        <p className="text-xs text-slate-500">
          Paste a user UUID (from Supabase Auth → Users). Grants unlimited listings + featured
          toggle for that seller.
        </p>
        <div className="flex gap-2">
          <input
            value={sellerUserId}
            onChange={(e) => setSellerUserId(e.target.value)}
            placeholder="user uuid"
            className="flex-1 bg-slate-950 border border-slate-700 h-10 px-3 rounded-xl text-sm font-mono"
          />
          <button
            type="button"
            className="px-4 h-10 rounded-xl bg-emerald-700 text-sm font-semibold"
            onClick={async () => {
              if (!sellerUserId.trim()) return;
              const { error } = await adminSetSellerPro(sellerUserId.trim(), true);
              if (error) toast.error(error);
              else toast.success('Seller Pro enabled');
            }}
          >
            Enable
          </button>
          <button
            type="button"
            className="px-4 h-10 rounded-xl border border-slate-600 text-sm"
            onClick={async () => {
              if (!sellerUserId.trim()) return;
              const { error } = await adminSetSellerPro(sellerUserId.trim(), false);
              if (error) toast.error(error);
              else toast.success('Seller Pro removed');
            }}
          >
            Revoke
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-white">Active listings</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-slate-500">No active listings.</p>
        ) : (
          listings.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between gap-2 border border-slate-800 rounded-xl px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <div className="font-medium truncate text-white">{l.title}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{l.user_id}</div>
              </div>
              <button
                type="button"
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  l.featured ? 'bg-amber-600 text-white' : 'border border-slate-600 text-slate-300'
                }`}
                onClick={async () => {
                  const { error } = await adminSetListingFeatured(l.id, !l.featured);
                  if (error) toast.error(error);
                  else {
                    toast.success(l.featured ? 'Unfeatured' : 'Featured');
                    void load();
                  }
                }}
              >
                {l.featured ? 'Featured' : 'Feature'}
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
