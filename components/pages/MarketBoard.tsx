'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ListingCard } from "@/components/listing-card";
import { Input } from "@/components/ui/input";
import { catLabel, surfaceLabel, t } from "@/lib/copy";
import { useAllListings } from "@/lib/listings-store";
import { useRvStore } from "@/lib/rv-store";
import { searchListings } from "@/lib/search";
import {
  CATEGORIES,
  MAIN_TILES,
  RACE_SURFACES,
  RACE_TILES,
  isCategory,
  isRaceSurface,
  type Category,
  type RaceSurface,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type SearchParams = { q?: string; cat?: string; surface?: string };

export default function Market() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("cat") ?? "all";
  const surface = searchParams.get("surface") ?? "all";
  const listings = useAllListings();
  const locale = useRvStore((s) => s.locale);
  const copy = t(locale);
  const [draft, setDraft] = useState(q);
  const category: Category | "all" = isCategory(cat) ? cat : "all";
  const raceSurface: RaceSurface | "all" = isRaceSurface(surface) ? surface : "all";

  const results = useMemo(
    () => searchListings(listings, { query: q, category, raceSurface }),
    [listings, q, category, raceSurface],
  );

  function commitQuery(
    nextQ: string,
    nextCat: Category | "all" = category,
    nextSurface: RaceSurface | "all" = nextCat === "racecar" ? raceSurface : "all",
  ) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextCat !== "all") params.set("cat", nextCat);
    if (nextCat === "racecar" && nextSurface !== "all") params.set("surface", nextSurface);
    const qs = params.toString();
    router.replace(qs ? `/market?${qs}` : "/market");
  }

  return (
    <AppShell>
      <section className="stagger-in space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {copy.marketPage.kicker}
            </p>
            <h1 className="font-display text-4xl font-semibold leading-none tracking-tight">
              {copy.marketPage.title}
            </h1>
            <p className="rv-copy text-muted">{copy.marketPage.intro}</p>
          </div>
          <Link
            href="/ads"
            className="mt-1 inline-flex h-10 shrink-0 items-center rounded-md px-3 text-sm text-muted hover:text-fg"
          >
            {copy.marketPage.myAds}
          </Link>
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            commitQuery(draft);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={copy.marketPage.searchPh}
              className="pl-10"
              aria-label={copy.marketPage.searchAria}
            />
          </div>
          <Link
            href="/scan"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-fg transition-transform duration-150 active:scale-[0.96]"
            aria-label={copy.marketPage.identifyAria}
          >
            <Camera className="size-5" />
          </Link>
        </form>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-subtle">
            {copy.marketPage.mainCategory}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {MAIN_TILES.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => commitQuery(draft, tile.id, tile.id === "racecar" ? "all" : "all")}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-2xl text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150",
                  category === tile.id && "shadow-[var(--shadow-border-hover)] ring-2 ring-primary",
                )}
              >
                <img src={tile.src} alt="" className="size-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent" />
                <span className="absolute bottom-2 left-2 font-display text-lg font-semibold tracking-wide">
                  {catLabel(locale, tile.id)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {category === "racecar" ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-subtle">
              {copy.marketPage.racingDirtAsphalt}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {RACE_TILES.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => commitQuery(draft, "racecar", tile.id)}
                  className={cn(
                    "relative aspect-[4/3] overflow-hidden rounded-2xl text-left shadow-[var(--shadow-border)]",
                    raceSurface === tile.id &&
                      "shadow-[var(--shadow-border-hover)] ring-2 ring-primary",
                  )}
                >
                  <img src={tile.src} alt="" className="size-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent" />
                  <span className="absolute bottom-2 left-2 font-display text-lg font-semibold sm:text-xl">
                    {surfaceLabel(locale, tile.id)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => commitQuery(draft, "all", "all")}
            className={cn(
              "h-9 rounded-full px-3.5 text-sm font-medium",
              category === "all" ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
            )}
          >
            {copy.marketPage.all}
          </button>
          {CATEGORIES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => commitQuery(draft, id, "all")}
              className={cn(
                "h-9 rounded-full px-3.5 text-sm font-medium",
                category === id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
              )}
            >
              {catLabel(locale, id)}
            </button>
          ))}
          {category === "racecar"
            ? RACE_SURFACES.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => commitQuery(draft, "racecar", id)}
                  className={cn(
                    "h-9 rounded-full px-3.5 text-sm font-medium",
                    raceSurface === id ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                  )}
                >
                  {surfaceLabel(locale, id)}
                </button>
              ))
            : null}
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {q || category !== "all" ? copy.marketPage.results : copy.marketPage.onTheBoard}
            </h2>
            <p className="text-sm tabular-nums text-subtle">{results.length}</p>
          </div>
          {results.length === 0 ? (
            <div className="rounded-3xl rv-glass px-5 py-12 text-center">
              <p className="font-display text-xl">{copy.marketPage.nothingMatches}</p>
              <p className="mt-1 text-sm text-muted">{copy.marketPage.emptyHint}</p>
              <Link
                href="/scan"
                className="mt-5 inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg"
              >
                {copy.scanCta}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}