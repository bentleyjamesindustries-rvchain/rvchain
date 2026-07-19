import { SEED_PARTS_LISTINGS, type PartsListing } from './partsListings';

const KEY = 'rvchain_parts_listings';

function normalize(raw: Partial<PartsListing> & Pick<PartsListing, 'id' | 'title' | 'price'>): PartsListing {
  return {
    id: raw.id,
    title: raw.title,
    partsCategory: raw.partsCategory ?? 'other',
    brand: raw.brand,
    condition: raw.condition ?? 'good',
    price: raw.price,
    quantity: raw.quantity ?? 1,
    city: raw.city ?? '',
    state: raw.state ?? 'TX',
    description: raw.description ?? '',
    image: raw.image ?? 'https://picsum.photos/id/133/800/500',
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

export function loadAllPartsListings(): PartsListing[] {
  if (typeof window === 'undefined') return SEED_PARTS_LISTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    const user: PartsListing[] = raw
      ? (JSON.parse(raw) as Partial<PartsListing>[]).map((l) =>
          normalize(l as Partial<PartsListing> & Pick<PartsListing, 'id' | 'title' | 'price'>)
        )
      : [];
    const seedIds = new Set(SEED_PARTS_LISTINGS.map((l) => l.id));
    return [
      ...user.filter((l) => !seedIds.has(l.id)),
      ...SEED_PARTS_LISTINGS,
      ...user.filter((l) => seedIds.has(l.id)),
    ].sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
  } catch {
    return SEED_PARTS_LISTINGS;
  }
}

export function loadUserPartsListingsOnly(userId?: string): PartsListing[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const listings: PartsListing[] = raw
      ? (JSON.parse(raw) as Partial<PartsListing>[]).map((l) =>
          normalize(l as Partial<PartsListing> & Pick<PartsListing, 'id' | 'title' | 'price'>)
        )
      : [];
    return listings
      .filter((l) => !l.isDemo && (!userId || l.sellerUserId === userId))
      .sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
  } catch {
    return [];
  }
}

export function saveUserPartsListing(listing: PartsListing) {
  const existing = loadUserPartsListingsOnly();
  const next = [listing, ...existing.filter((l) => l.id !== listing.id)];
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function removeUserPartsListing(listingId: string) {
  const next = loadUserPartsListingsOnly().filter((l) => l.id !== listingId);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function markPartsListingSold(listingId: string, saleId: string): PartsListing | null {
  const all = loadUserPartsListingsOnly();
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
