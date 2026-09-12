"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CATALOG } from "./catalog";
import { isCategory, isRaceSurface, type Listing } from "./types";

type ListingsState = {
  mine: Listing[];
  addMine: (listing: Listing) => void;
  removeMine: (id: string) => void;
};

export const useListingsStore = create<ListingsState>()(
  persist(
    (set) => ({
      mine: [],
      addMine: (listing) =>
        set((state) => ({
          mine: [listing, ...state.mine.filter((item) => item.id !== listing.id)].slice(
            0,
            24,
          ),
        })),
      removeMine: (id) =>
        set((state) => ({ mine: state.mine.filter((item) => item.id !== id) })),
    }),
    { name: "trailscan-ads" },
  ),
);

export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function useAllListings(): Listing[] {
  const mine = useListingsStore((s) => s.mine);
  const mounted = useHasMounted();
  const rows = Array.isArray(mine) ? mine : [];
  const extra = mounted ? rows.map(normalizeListing) : [];
  const extraIds = new Set(extra.map((item) => item.id));
  return [...extra, ...CATALOG.filter((item) => !extraIds.has(item.id))];
}

export function useListing(id: string): Listing | undefined {
  const mine = useListingsStore((s) => s.mine);
  const mounted = useHasMounted();
  const rows = Array.isArray(mine) ? mine : [];
  const fromMine = mounted ? rows.find((item) => item.id === id) : undefined;
  const found = fromMine ?? CATALOG.find((item) => item.id === id);
  return found ? normalizeListing(found) : undefined;
}

function normalizeListing(listing: Listing): Listing {
  const raw = listing.category as string;
  const category = isCategory(raw) ? raw : "atv";
  return {
    ...listing,
    category,
    raceSurface:
      category === "racecar" && listing.raceSurface && isRaceSurface(listing.raceSurface)
        ? listing.raceSurface
        : null,
  };
}
