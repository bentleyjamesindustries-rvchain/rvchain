import type { RvListing } from './rvListings';

export interface RvCertificationRecord {
  listingId: string;
  certified: boolean;
  certifiedAt: string;
  certifiedBy: string;
}

export interface RvCertificationDisplay {
  certifiedAt: string;
  certifiedBy?: string;
}

export function getRvCertificationInfo(listing: RvListing): RvCertificationDisplay | null {
  if (!listing.rvchainCertified && !listing.certifiedAt) return null;
  return {
    certifiedAt: listing.certifiedAt ?? new Date().toISOString(),
    certifiedBy: listing.certifiedBy,
  };
}

export function createRvCertificationRecord(
  listing: RvListing,
  certifiedBy: string
): RvCertificationRecord {
  return {
    listingId: listing.id,
    certified: true,
    certifiedAt: new Date().toISOString(),
    certifiedBy,
  };
}

export function applyCertificationToListing(
  listing: RvListing,
  record: RvCertificationRecord
): RvListing {
  return {
    ...listing,
    rvchainCertified: true,
    certifiedAt: record.certifiedAt,
    certifiedBy: record.certifiedBy,
  };
}