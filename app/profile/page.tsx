"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/supabaseClient";

type Account = { name: string; email: string };

export default function ProfilePage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [offline, setOffline] = useState(false);
  const [ready, setReady] = useState(false);

  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error_description") || params.get("error");
    if (oauthError) setProblem(oauthError);
    const apply = (user: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined) => {
      setAccount(
        user
          ? {
              name: String(user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || user.email || "Account"),
              email: user.email ?? "",
            }
          : null,
      );
      setReady(true);
    };
    const timer = window.setTimeout(() => {
      if (alive) {
        setOffline(true);
        setReady(true);
      }
    }, 6000);
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      window.clearTimeout(timer);
      apply(session?.user);
    });
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        window.clearTimeout(timer);
        apply(data.session?.user);
      })
      .catch(() => {
        if (!alive) return;
        window.clearTimeout(timer);
        setOffline(true);
        setReady(true);
      });
    return () => {
      alive = false;
      window.clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <AppShell>
      <section className="mx-auto max-w-xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Account</p>
        <h1 className="font-display text-4xl font-semibold leading-none">Your profile</h1>
        {!ready ? (
          <div className="h-28 animate-pulse rounded-3xl rv-glass" />
        ) : offline && !account ? (
          <div className="rv-glass space-y-3 rounded-3xl p-5">
            <p className="text-muted">
              Google and X on this site go through Supabase, and that project is offline. Sign-in
              cannot finish until that project is back.
            </p>
            <Link href="/" className="text-sm font-semibold text-primary">
              Back home
            </Link>
          </div>
        ) : !account ? (
          <p className="rv-glass rounded-3xl p-5 text-muted">
            {problem
              ? problem
              : "Use Google or X at the top. Your name and email land on this profile."}
          </p>
        ) : (
          <div className="rv-glass rounded-3xl p-5">
            <p className="font-display text-2xl font-semibold">{account.name}</p>
            <p className="text-sm text-muted">{account.email}</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
