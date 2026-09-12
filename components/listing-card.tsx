'use client';

import Link from "next/link";
import { condLabel, kindLabel } from "@/lib/copy";
import { useRvStore } from "@/lib/rv-store";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ListingCard({ listing }: { listing: Listing }) {
  const locale = useRvStore((s) => s.locale);

  return (
    <Link
      href={`/listings/${listing.id}`}
      
      className="group block overflow-hidden rounded-2xl rv-glass transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-border-hover)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-elevated">
        <img
          src={listing.photo}
          alt={listing.title}
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          <Badge className="bg-bg/80 text-fg backdrop-blur-sm">{kindLabel(locale, listing)}</Badge>
        </div>

        <div className="absolute bottom-2.5 right-2.5">
          <Badge tone="primary" className="tabular-nums">
            {formatPrice(listing.price)}
          </Badge>
        </div>
      </div>
      <div className="space-y-1.5 p-3.5">
        <p className="font-display text-lg font-semibold leading-snug tracking-tight text-fg">
          {listing.title}
        </p>
        <p className="text-sm text-muted">{listing.fitment}</p>
        <p className="text-xs text-subtle">
          {condLabel(locale, listing.condition)}
          {listing.location ? ` · ${listing.location}` : ""}
        </p>
      </div>
    </Link>
  );
}