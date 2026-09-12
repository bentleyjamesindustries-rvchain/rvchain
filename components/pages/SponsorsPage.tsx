'use client';

import { AppShell } from "@/components/app-shell";
import { t } from "@/lib/copy";
import { useRvStore } from "@/lib/rv-store";

export default function SponsorsPage() {
  const locale = useRvStore((s) => s.locale);
  const copy = t(locale);

  return (
    <AppShell>
      <section className="mx-auto max-w-xl space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {copy.sponsorsPage.kicker}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-none tracking-tight">
            {copy.sponsorsPage.title}
          </h1>
        </div>
        <div className="rv-glass min-h-64 rounded-3xl" />
      </section>
    </AppShell>
  );
}
