import { SEED_RV_LISTINGS, type RvListing } from './rvListings';

const LISTINGS_KEY = 'rvchain_rv_listings';
const INTEREST_KEY = 'rvchain_rv_interest';

export interface RvListingInterest {
  listingId: string;
  listingTitle: string;
  message: string;
  contactEmail?: string;
  userId?: string;
  createdAt: string;
}

export function loadAllListings(): RvListing[] {
  if (typeof window === 'undefined') return SEED_RV_LISTINGS;
  try {
    const raw = localStorage.getItem(LISTINGS_KEY);
    const userListings: RvListing[] = raw ? JSON.parse(raw) : [];
    const seedIds = new Set(SEED_RV_LISTINGS.map((l) => l.id));
    const merged = [
      ...userListings.filter((l) => !seedIds.has(l.id)),
      ...SEED_RV_LISTINGS,
      ...userListings.filter((l) => seedIds.has(l.id)),
    ];
    return merged.sort(
      (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
    );
  } catch {
    return SEED_RV_LISTINGS;
  }
}

export function saveUserListing(listing: RvListing) {
  const existing = loadUserListingsOnly();
  const next = [listing, ...existing.filter((l) => l.id !== listing.id)];
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(next));
}

export function loadUserListingsOnly(userId?: string): RvListing[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LISTINGS_KEY);
    const listings: RvListing[] = raw ? JSON.parse(raw) : [];
    return listings
      .filter((l) => !l.isDemo && (!userId || l.sellerUserId === userId))
      .sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
  } catch {
    return [];
  }
}

export function removeUserListing(listingId: string) {
  const next = loadUserListingsOnly().filter((l) => l.id !== listingId);
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(next));
}

export function saveListingInterest(interest: RvListingInterest) {
  const existing = loadListingInterests();
  localStorage.setItem(INTEREST_KEY, JSON.stringify([interest, ...existing]));
}

export function loadListingInterests(): RvListingInterest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INTEREST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}