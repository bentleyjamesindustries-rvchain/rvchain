import type { RvListing } from './rvListings';
import { sha256Hex, getOpenTimestampsProofUrl } from './spotVerification';

export interface RvCertificationPayload {
  listingId: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  city: string;
  state: string;
  sellerName: string;
  sellerUserId?: string;
  certifiedAt: string;
  certifiedBy: string;
  program: 'rvchain-seller';
}

export interface RvCertificationRecord {
  listingId: string;
  certified: boolean;
  certificationHash: string;
  certificationOts: string | null;
  certifiedAt: string;
  certifiedBy: string;
  proofUrl: string;
}

export interface RvCertificationDisplay {
  hash: string;
  certifiedAt: string;
  certifiedBy?: string;
  proofUrl: string;
  otsAvailable?: boolean;
}

export function buildRvCertificationPayload(
  listing: RvListing,
  certifiedBy: string,
  certifiedAt = new Date().toISOString()
): RvCertificationPayload {
  return {
    listingId: listing.id,
    title: listing.title,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    price: listing.price,
    city: listing.city,
    state: listing.state,
    sellerName: listing.sellerName,
    sellerUserId: listing.sellerUserId,
    certifiedAt,
    certifiedBy,
    program: 'rvchain-seller',
  };
}

function certificationPayloadJson(payload: RvCertificationPayload): string {
  return JSON.stringify(payload, Object.keys(payload).sort());
}

export function getRvCertificationInfo(
  listing: RvListing,
  record?: RvCertificationRecord | null
): RvCertificationDisplay | null {
  const hash = record?.certificationHash ?? listing.certificationHash;
  if (!hash || hash.length < 32) return null;
  if (!record?.certified && !listing.rvchainCertified) return null;

  return {
    hash,
    certifiedAt: record?.certifiedAt ?? listing.certifiedAt ?? new Date().toISOString(),
    certifiedBy: record?.certifiedBy ?? listing.certifiedBy,
    proofUrl: record?.proofUrl ?? listing.certificationProofUrl ?? getOpenTimestampsProofUrl(hash),
    otsAvailable: Boolean(record?.certificationOts ?? listing.certificationOts),
  };
}

export async function createRvCertificationRecord(
  listing: RvListing,
  certifiedBy: string
): Promise<RvCertificationRecord> {
  const certifiedAt = new Date().toISOString();
  const payload = buildRvCertificationPayload(listing, certifiedBy, certifiedAt);
  const hashHex = await sha256Hex(certificationPayloadJson(payload));

  let otsBase64: string | null = null;
  try {
    const res = await fetch('/api/opentimestamps/stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: hashHex }),
    });
    if (res.ok) {
      const data = await res.json();
      otsBase64 = data.otsBase64 ?? null;
    }
  } catch {
    // Hash still valid; OTS may complete later
  }

  return {
    listingId: listing.id,
    certified: true,
    certificationHash: hashHex,
    certificationOts: otsBase64,
    certifiedAt,
    certifiedBy,
    proofUrl: getOpenTimestampsProofUrl(hashHex),
  };
}

export function applyCertificationToListing(
  listing: RvListing,
  record: RvCertificationRecord
): RvListing {
  return {
    ...listing,
    rvchainCertified: true,
    certificationHash: record.certificationHash,
    certificationOts: record.certificationOts,
    certifiedAt: record.certifiedAt,
    certifiedBy: record.certifiedBy,
    certificationProofUrl: record.proofUrl,
  };
}