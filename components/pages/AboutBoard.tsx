'use client';

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/copy";
import { useRvStore } from "@/lib/rv-store";

export default function AboutPage() {
  const locale = useRvStore((s) => s.locale);
  const copy = t(locale);

  return (
    <AppShell>
      <article className="rv-glass mx-auto max-w-xl space-y-5 rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {copy.aboutPage.kicker}
        </p>
        <h1 className="font-display text-4xl font-semibold leading-none tracking-tight">
          {copy.aboutPage.title}
        </h1>
        <p className="rv-copy text-muted">{copy.aboutPage.p1}</p>
        <p>{copy.aboutPage.p2}</p>
        <p>{copy.aboutPage.p3}</p>
        <ul className="space-y-1 text-sm text-muted">
          <li>{copy.aboutPage.li1}</li>
          <li>{copy.aboutPage.li2}</li>
          <li>{copy.aboutPage.li3}</li>
        </ul>
        <p className="text-sm text-subtle">{copy.aboutPage.questions}</p>
        <Button asChild>
          <Link href="/scan">{copy.scanCta}</Link>
        </Button>
      </article>
    </AppShell>
  );
}