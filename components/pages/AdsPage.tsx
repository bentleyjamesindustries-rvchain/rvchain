'use client';

import Link from "next/link";
import { Camera, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/copy";
import { useListingsStore } from "@/lib/listings-store";
import { useRvStore } from "@/lib/rv-store";

export default function AdsPage() {
  const mine = useListingsStore((s) => s.mine);
  const removeMine = useListingsStore((s) => s.removeMine);
  const locale = useRvStore((s) => s.locale);
  const copy = t(locale);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-none tracking-tight">
              {copy.adsPage.title}
            </h1>
            <p className="rv-copy mt-2 text-muted">{copy.adsPage.intro}</p>
          </div>
          <Button asChild>
            <Link href="/scan">
              <Camera />
              {copy.scanCta}
            </Link>
          </Button>
        </div>

        {mine.length === 0 ? (
          <div className="rounded-3xl rv-glass px-5 py-16 text-center">
            <p className="font-display text-2xl font-semibold">{copy.adsPage.empty}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{copy.adsPage.emptyHint}</p>
            <Button asChild className="mt-6">
              <Link href="/scan">{copy.scanCta}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((listing) => (
              <div key={listing.id} className="relative">
                <ListingCard listing={listing} />
                <button
                  type="button"
                  onClick={() => removeMine(listing.id)}
                  className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-bg/80 text-fg backdrop-blur-sm"
                  aria-label={`${copy.adsPage.remove} ${listing.title}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}