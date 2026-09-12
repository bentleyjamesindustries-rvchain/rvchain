'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";

import { ListingCard } from "@/components/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { condLabel, kindLabel, t } from "@/lib/copy";
import { useHasMounted, useAllListings, useListing } from "@/lib/listings-store";
import { useRvStore } from "@/lib/rv-store";

import { matchIdentification } from "@/lib/search";
import { formatPrice } from "@/lib/utils";

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const listings = useAllListings();
  const mounted = useHasMounted();
  const listing = useListing(id);
  const locale = useRvStore((s) => s.locale);
  const copy = t(locale);

  if (!listing) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg py-16 text-center">
          <h1 className="font-display text-3xl font-semibold">
            {mounted ? copy.listingPage.notFound : copy.listingPage.loading}
          </h1>
          {mounted ? (
            <>
              <p className="mt-2 text-muted">{copy.listingPage.stale}</p>
              <Button asChild className="mt-6">
                <Link href="/market">{copy.listingPage.backToMarket}</Link>
              </Button>
            </>
          ) : (
            <p className="mt-2 text-muted">{copy.listingPage.pulling}</p>
          )}
        </div>
      </AppShell>
    );
  }

  const related = matchIdentification(
    listings.filter((item) => item.id !== listing.id),
    {
      name: listing.title,
      summary: listing.description,
      category: listing.category,
      raceSurface: listing.raceSurface ?? null,
      partType: listing.partType,
      fitment: listing.fitment,
      likelyFits: [listing.fitment],
      conditionGuess: listing.condition,
      estimatedLow: listing.price,
      estimatedHigh: listing.price,
      confidence: 1,
      identifiers: [],
      tags: listing.tags,
    },
  ).slice(0, 3);

  return (
    <AppShell>
      <article className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/market"
          className="inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          {copy.market}
        </Link>
        <img
          src={listing.photo}
          alt={listing.title}
          className="aspect-[4/3] w-full rounded-3xl object-cover"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{kindLabel(locale, listing)}</Badge>
          <Badge>{condLabel(locale, listing.condition)}</Badge>
          {listing.source === "mine" ? <Badge tone="success">{copy.listingPage.yourAd}</Badge> : null}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="max-w-xl font-display text-4xl font-semibold leading-none tracking-tight">
            {listing.title}
          </h1>
          <p className="font-display text-3xl font-semibold tabular-nums">
            {formatPrice(listing.price)}
          </p>
        </div>
        <p className="rv-copy text-muted">{listing.fitment}</p>
        {listing.location ? (
          <p className="inline-flex items-center gap-1.5 text-sm text-subtle">
            <MapPin className="size-3.5" />
            {listing.location}
          </p>
        ) : null}
        <p className="max-w-prose text-pretty leading-relaxed">{listing.description}</p>
        {listing.highlights.length > 0 ? (
          <ul className="space-y-2 text-sm text-muted">
            {listing.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {h}
              </li>
            ))}
          </ul>
        ) : null}
        {listing.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <Link
                key={tag}
                href={`/market?q=${encodeURIComponent(tag)}`}
                className="h-8 rounded-full bg-elevated px-3 text-xs leading-8 text-muted hover:text-fg"
              >
                {tag}
              </Link>
            ))}
          </div>
        ) : null}
        {listing.source === "mine" ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/ads">{copy.listingPage.yourAds}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/scan">{copy.listingPage.identifySimilar}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  const text = [
                    `${copy.listingPage.inquiryPrefix} ${listing.title}`,
                    `${formatPrice(listing.price)} · ${listing.fitment}`,
                    listing.location ? `${copy.listingPage.pickupPrefix} ${listing.location}` : null,
                  ]
                    .filter(Boolean)
                    .join(". ");
                  void navigator.clipboard.writeText(text).then(
                    () => toast.success(copy.listingPage.inquiryCopied),
                    () => toast.error(copy.listingPage.couldNotCopy),
                  );
                }}
              >
                <Copy />
                {copy.listingPage.contactSeller}
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/scan">{copy.listingPage.identifySimilar}</Link>
              </Button>
            </div>
            <p className="text-xs text-subtle">{copy.listingPage.privateParty}</p>
          </div>
        )}

        {related.length > 0 ? (
          <div className="space-y-3 pt-4">
            <h2 className="font-display text-2xl font-semibold">{copy.listingPage.related}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </AppShell>
  );
}