import type { Category, Identification, Listing, RaceSurface } from "./types";

export type SearchFilters = {
  query: string;
  category: Category | "all";
  raceSurface: RaceSurface | "all";
};

function haystack(listing: Listing) {
  return [
    listing.title,
    listing.description,
    listing.partType,
    listing.fitment,
    listing.location,
    listing.category,
    listing.raceSurface ?? "",
    ...listing.tags,
    ...listing.highlights,
  ]
    .join(" ")
    .toLowerCase();
}

export function searchListings(listings: Listing[], filters: SearchFilters) {
  const q = filters.query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  return listings
    .filter((listing) => {
      if (filters.category !== "all" && listing.category !== filters.category) {
        return false;
      }
      if (
        filters.raceSurface !== "all" &&
        listing.raceSurface !== filters.raceSurface
      ) {
        return false;
      }
      if (tokens.length === 0) return true;
      const text = haystack(listing);
      return tokens.every((token) => text.includes(token));
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function matchIdentification(listings: Listing[], idn: Identification) {
  const needles = [
    idn.partType,
    idn.name,
    idn.category === "unknown" ? "" : idn.category,
    idn.raceSurface ?? "",
    ...idn.tags,
    ...idn.likelyFits,
  ]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  return listings
    .map((listing) => {
      const text = haystack(listing);
      let score = 0;
      if (idn.category !== "unknown" && listing.category === idn.category) score += 6;
      if (idn.raceSurface && listing.raceSurface === idn.raceSurface) score += 4;
      if (text.includes(idn.partType.toLowerCase())) score += 8;
      for (const token of needles) {
        if (text.includes(token)) score += 1;
      }
      return { listing, score };
    })
    .filter((row) => row.score >= 4)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.listing);
}
