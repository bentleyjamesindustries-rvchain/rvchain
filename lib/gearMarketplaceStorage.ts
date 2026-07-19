import { SEED_GEAR_LISTINGS, type GearListing } from './gearListings';

const KEY = 'rvchain_gear_listings';

function normalize(raw: Partial<GearListing> & Pick<GearListing, 'id' | 'title' | 'price'>): GearListing {
  return {
    id: raw.id,
    title: raw.title,
    gearCategory: raw.gearCategory ?? 'other',
    brand: raw.brand,
    condition: raw.condition ?? 'good',
    price: raw.price,
    quantity: raw.quantity ?? 1,
    city: raw.city ?? '',
    state: raw.state ?? 'TX',
    description: raw.description ?? '',
    image: raw.image ?? 'https://picsum.photos/id/201/800/500',
    sellerName: raw.sellerName ?? 'Seller',
    sellerUserId: raw.sellerUserId,
    listedAt: raw.listedAt ?? new Date().toISOString(),
    isDemo: raw.isDemo,
    listingAccess: raw.listingAccess,
    expiresAt: raw.expiresAt ?? null,
    status: raw.status ?? 'active',
    soldAt: raw.soldAt,
    saleId: raw.saleId,
  };
}

export function loadAllGearListings(): GearListing[] {
  if (typeof window === 'undefined') return SEED_GEAR_LISTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    const user: GearListing[] = raw
      ? (JSON.parse(raw) as Partial<GearListing>[]).map((l) =>
          normalize(l as Partial<GearListing> & Pick<GearListing, 'id' | 'title' | 'price'>)
        )
      : [];
    const seedIds = new Set(SEED_GEAR_LISTINGS.map((l) => l.id));
    return [
      ...user.filter((l) => !seedIds.has(l.id)),
      ...SEED_GEAR_LISTINGS,
      ...user.filter((l) => seedIds.has(l.id)),
    ].sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
  } catch {
    return SEED_GEAR_LISTINGS;
  }
}

export function loadUserGearListingsOnly(userId?: string): GearListing[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const listings: GearListing[] = raw
      ? (JSON.parse(raw) as Partial<GearListing>[]).map((l) =>
          normalize(l as Partial<GearListing> & Pick<GearListing, 'id' | 'title' | 'price'>)
        )
      : [];
    return listings
      .filter((l) => !l.isDemo && (!userId || l.sellerUserId === userId))
      .sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
  } catch {
    return [];
  }
}

export function saveUserGearListing(listing: GearListing) {
  const existing = loadUserGearListingsOnly();
  const next = [listing, ...existing.filter((l) => l.id !== listing.id)];
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function removeUserGearListing(listingId: string) {
  const next = loadUserGearListingsOnly().filter((l) => l.id !== listingId);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function markGearListingSold(listingId: string, saleId: string): GearListing | null {
  const all = loadUserGearListingsOnly();
  const idx = all.findIndex((l) => l.id === listingId);
  if (idx < 0) return null;
  all[idx] = {
    ...all[idx],
    status: 'sold',
    soldAt: new Date().toISOString(),
    saleId,
  };
  localStorage.setItem(KEY, JSON.stringify(all));
  return all[idx];
}
