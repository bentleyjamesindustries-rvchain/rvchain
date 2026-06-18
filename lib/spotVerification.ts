import type { Park } from './parks';

export interface SpotVerificationPayload {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  image: string | null;
  price: number | null;
  amenities: string[];
  verifiedAt: string;
  verifiedBy: string;
}

export interface SpotVerificationRecord {
  verified: boolean;
  verificationHash: string;
  verificationOts: string | null;
  verifiedAt: string;
  verifiedBy: string;
  proofUrl: string;
}

export function buildVerificationPayload(
  park: Park,
  verifiedBy: string,
  verifiedAt = new Date().toISOString()
): SpotVerificationPayload {
  return {
    id: park.id,
    name: park.name,
    city: park.city ?? null,
    state: park.state ?? null,
    lat: park.lat ?? null,
    lng: park.lng ?? null,
    description: park.description ?? null,
    image: park.image ?? null,
    price: park.price ?? null,
    amenities: [...(park.amenities ?? [])].sort(),
    verifiedAt,
    verifiedBy,
  };
}

export function canonicalPayloadJson(payload: SpotVerificationPayload): string {
  return JSON.stringify(payload, Object.keys(payload).sort());
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getOpenTimestampsProofUrl(hashHex: string): string {
  return `https://ots.summa.one/?hash=${hashHex}`;
}

export interface ParkVerificationDisplay {
  hash: string;
  verifiedAt: string;
  verifiedBy?: string;
  proofUrl: string;
  otsAvailable?: boolean;
}

export function getParkVerificationInfo(park: Park): ParkVerificationDisplay | null {
  if (!park.verified && !park.verification_hash) return null;

  const rawHash = park.verification_hash ?? park.verification_tx?.replace(/^0x/, '') ?? '';
  if (!rawHash || rawHash.length < 32) return null;

  return {
    hash: rawHash,
    verifiedAt: park.verified_at ?? new Date().toISOString(),
    verifiedBy: park.verified_by ?? undefined,
    proofUrl: park.verification_proof_url ?? getOpenTimestampsProofUrl(rawHash),
    otsAvailable: Boolean(park.verification_ots),
  };
}

export async function createSpotVerificationRecord(
  park: Park,
  verifiedBy: string
): Promise<SpotVerificationRecord> {
  const verifiedAt = new Date().toISOString();
  const payload = buildVerificationPayload(park, verifiedBy, verifiedAt);
  const hashHex = await sha256Hex(canonicalPayloadJson(payload));

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
    verified: true,
    verificationHash: hashHex,
    verificationOts: otsBase64,
    verifiedAt,
    verifiedBy,
    proofUrl: getOpenTimestampsProofUrl(hashHex),
  };
}