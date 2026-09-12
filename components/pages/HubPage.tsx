'use client';

import Link from "next/link";
import { ArrowRight, Camera, Download, LayoutGrid } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { catLabel, t } from "@/lib/copy";
import { useRvStore } from "@/lib/rv-store";
import { MAIN_TILES } from "@/lib/types";

export default function Hub() {
  const locale = useRvStore((s) => s.locale);
  const copy = t(locale);

  return (
    <AppShell>
      <section className="stagger-in space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {copy.kicker}
            </p>
            <h1 className="font-display text-4xl font-semibold leading-none tracking-tighter sm:text-6xl">
              {copy.hero}
            </h1>
            <p className="rv-copy max-w-md text-muted">{copy.sub}</p>
          </div>
          <div className="flex w-full flex-col gap-2 min-[400px]:flex-row sm:w-auto">
            <Button asChild size="lg" className="rounded-3xl">
              <Link href="/scan">
                <Camera />
                {copy.scanCta}
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-3xl bg-fg text-bg hover:opacity-90">
              <Link href="/market">
                <LayoutGrid />
                {copy.marketCta}
              </Link>
            </Button>
          </div>
        </div>

        <div>
          <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-muted">
            {copy.shopBy}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {MAIN_TILES.map((tile) => (
              <Link
                key={tile.id}
                href={`/market?cat=${tile.id}`}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-border)] transition-transform duration-150 hover:-translate-y-0.5"
              >
                <img src={tile.src} alt="" className="size-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent" />
                <span className="absolute bottom-2 left-2 font-display text-lg font-semibold">
                  {catLabel(locale, tile.id)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/scan"
            className="rv-glass group rounded-3xl p-5 transition-transform duration-150 hover:-translate-y-0.5 sm:p-6"
          >
            <Camera className="mb-3 size-8 text-primary" />
            <span className="flex items-center gap-2 font-display text-xl font-semibold">
              {copy.identifyCard}
              <ArrowRight className="size-4 text-subtle transition-transform duration-150 group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1.5 block text-sm text-muted">{copy.identifyCardSub}</span>
          </Link>
          <Link
            href="/market"
            className="rv-glass group rounded-3xl p-5 transition-transform duration-150 hover:-translate-y-0.5 sm:p-6"
          >
            <LayoutGrid className="mb-3 size-8 text-primary" />
            <span className="flex items-center gap-2 font-display text-xl font-semibold">
              {copy.marketCard}
              <ArrowRight className="size-4 text-subtle transition-transform duration-150 group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1.5 block text-sm text-muted">{copy.marketCardSub}</span>
          </Link>
        </div>

        <a
          href="/rv-chain-desktop.zip"
          download="rv-chain-desktop.zip"
          className="rv-glass group flex items-center gap-4 rounded-3xl p-5 transition-transform duration-150 hover:-translate-y-0.5 sm:p-6"
        >
          <Download className="size-8 shrink-0 text-primary" />
          <span>
            <span className="flex items-center gap-2 font-display text-xl font-semibold">
              {copy.download}
              <ArrowRight className="size-4 text-subtle transition-transform duration-150 group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1.5 block text-sm text-muted">{copy.downloadHint}</span>
          </span>
        </a>

        <p className="rv-copy max-w-md text-center text-[11px] text-subtle sm:mx-auto">
          {copy.footer}{" "}
          <Link href="/about" className="text-muted underline-offset-2 hover:text-fg hover:underline">
            {copy.about}
          </Link>
        </p>
      </section>
    </AppShell>
  );
}