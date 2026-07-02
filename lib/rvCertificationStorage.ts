import type { RvListing } from './rvListings';
import type { RvCertificationRecord } from './rvCertification';
import { applyCertificationToListing } from './rvCertification';

const KEY = 'rvchain_rv_certifications';

/** Demo seed certifications for sample marketplace listings */
const SEED_CERTIFICATIONS: Record<string, RvCertificationRecord> = {
  'rv-seed-1': {
    listingId: 'rv-seed-1',
    certified: true,
    certificationHash: 'a3f8c2e91b047d6e5f8a1c3d9e2b4f7086a5c1d3e9f2a8b4c6d0e1f3a5b7c9d2e4',
    certificationOts: null,
    certifiedAt: '2026-06-10T14:00:00.000Z',
    certifiedBy: 'rvchain-services',
    proofUrl:
      'https://ots.summa.one/?hash=a3f8c2e91b047d6e5f8a1c3d9e2b4f7086a5c1d3e9f2a8b4c6d0e1f3a5b7c9d2e4',
  },
  'rv-seed-3': {
    listingId: 'rv-seed-3',
    certified: true,
    certificationHash: 'b7d1e4f92a358c6d0e9b2a4f1c8d3e5077b6a2c4d8e0f1a3b5c7d9e1f2a4b6c8d0e2',
    certificationOts: null,
    certifiedAt: '2026-06-12T18:00:00.000Z',
    certifiedBy: 'rvchain-services',
    proofUrl:
      'https://ots.summa.one/?hash=b7d1e4f92a358c6d0e9b2a4f1c8d3e5077b6a2c4d8e0f1a3b5c7d9e1f2a4b6c8d0e2',
  },
  'rv-seed-11': {
    listingId: 'rv-seed-11',
    certified: true,
    certificationHash: 'c9e2f5a13b469d7e1f0a3b5c2d9e4f6188c7b3d5e0f2a4b6c8d0e2f4a6b8c0d2e4',
    certificationOts: null,
    certifiedAt: '2026-06-16T11:00:00.000Z',
    certifiedBy: 'rvchain-services',
    proofUrl:
      'https://ots.summa.one/?hash=c9e2f5a13b469d7e1f0a3b5c2d9e4f6188c7b3d5e0f2a4b6c8d0e2f4a6b8c0d2e4',
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