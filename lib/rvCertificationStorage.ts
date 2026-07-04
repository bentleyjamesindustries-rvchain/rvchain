import type { RvListing } from './rvListings';
import type { RvCertificationRecord } from './rvCertification';
import { applyCertificationToListing } from './rvCertification';

const KEY = 'rvchain_rv_certifications';

const SEED_CERTIFICATIONS: Record<string, RvCertificationRecord> = {
  'rv-seed-1': {
    listingId: 'rv-seed-1',
    certified: true,
    certifiedAt: '2026-06-10T14:00:00.000Z',
    certifiedBy: 'rvchain-services',
  },
  'rv-seed-3': {
    listingId: 'rv-seed-3',
    certified: true,
    certifiedAt: '2026-06-12T18:00:00.000Z',
    certifiedBy: 'rvchain-services',
  },
  'rv-seed-11': {
    listingId: 'rv-seed-11',
    certified: true,
    certifiedAt: '2026-06-16T11:00:00.000Z',
    certifiedBy: 'rvchain-services',
  },
};

type Store = Record<string, RvCertificationRecord>;

function loadStore(): Store {
  if (typeof window === 'undefined') return { ...SEED_CERTIFICATIONS };
  try {
    const raw = localStorage.getItem(KEY);
    const userStore: Store = raw ? JSON.parse(raw) : {};
    return { ...SEED_CERTIFICATIONS, ...userStore };
  } catch {
    return { ...SEED_CERTIFICATIONS };
  }
}

export function getRvCertification(listingId: string): RvCertificationRecord | null {
  const store = loadStore();
  return store[listingId] ?? null;
}

export function saveRvCertification(record: RvCertificationRecord) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const store: Store = raw ? JSON.parse(raw) : {};
    store[record.listingId] = record;
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function enrichListingWithCertification(listing: RvListing): RvListing {
  const record = getRvCertification(listing.id);
  if (!record?.certified) return listing;
  return applyCertificationToListing(listing, record);
}

export function enrichAllListings(listings: RvListing[]): RvListing[] {
  return listings.map(enrichListingWithCertification);
}