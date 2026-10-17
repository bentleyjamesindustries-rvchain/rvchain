"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { useRvStore } from "@/lib/rv-store";

export function SignInBar() {
  const locale = useRvStore((s) => s.locale);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const es = locale === "es";

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const user = data.session?.user;
      setEmail(user ? user.email || user.user_metadata?.user_name || user.id : null);
      setReady(true);
    });
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error_description") || params.get("error");
    if (oauthError) toast.error(oauthError);
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setEmail(user ? user.email || user.user_metadata?.user_name || user.id : null);
      setReady(true);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (!ready || email) return null;

  async function go(provider: "google" | "x") {
    if (!isSupabaseConfigured) {
      toast.error(
        es
          ? "El acceso aún no está conectado en este sitio."
          : "Sign-in is not connected on this site yet.",
      );
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/profile` },
      });
      if (error) {
        toast.error(
          /fetch|network|failed/i.test(error.message)
            ? es
              ? "No se puede llegar a Supabase. Ese proyecto está apagado, así que Google y X no entran."
              : "Can't reach Supabase. That project is offline, so Google and X can't sign in."
            : error.message,
        );
      }
    } catch {
      toast.error(
        es
          ? "No se puede llegar a Supabase. Ese proyecto está apagado, así que Google y X no entran."
          : "Can't reach Supabase. That project is offline, so Google and X can't sign in.",
      );
    }
  }

  return (
    <div className="border-b border-border bg-bg/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{es ? "Entrar" : "Sign in"}</p>
          <p className="text-xs text-muted">
            {es ? "Google o X es el acceso de clientes." : "Google or X is the customer sign-in."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void go("google")}
            className="h-10 flex-1 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg sm:flex-none"
          >
            {es ? "Continuar con Google" : "Continue with Google"}
          </button>
          <button
            type="button"
            onClick={() => void go("x")}
            className="h-10 flex-1 rounded-full bg-fg px-4 text-sm font-semibold text-bg sm:flex-none"
          >
            {es ? "Continuar con X" : "Continue with X"}
          </button>
        </div>
      </div>
    </div>
  );
}
