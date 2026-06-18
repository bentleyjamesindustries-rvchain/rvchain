import type { Park } from './parks';
import type { SpotVerificationRecord } from './spotVerification';
import { getOpenTimestampsProofUrl } from './spotVerification';

const KEY = 'rvchain_spot_verifications';

type Store = Record<string, SpotVerificationRecord>;

function read(): Store {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Store;
  } catch {
    return {};
  }
}

function write(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getLocalVerification(parkId: string): SpotVerificationRecord | null {
  return read()[parkId] ?? null;
}

export function saveLocalVerification(parkId: string, record: SpotVerificationRecord) {
  const store = read();
  store[parkId] = record;
  write(store);
}

export function mergeParkVerification(park: Park): Park {
  const local = getLocalVerification(park.id);
  if (local) {
    return {
      ...park,
      verified: true,
      verification_hash: local.verificationHash,
      verification_ots: local.verificationOts,
      verified_at: local.verifiedAt,
      verified_by: local.verifiedBy,
      verification_proof_url: local.proofUrl,
    };
  }

  const hash = park.verification_hash ?? null;
  if (hash || park.verified) {
    const proofHash = hash ?? park.verification_tx?.replace(/^0x/, '') ?? null;
    return {
      ...park,
      verified: park.verified ?? Boolean(hash),
      verification_proof_url:
        park.verification_proof_url ??
        (proofHash ? getOpenTimestampsProofUrl(proofHash) : null),
    };
  }

  return park;
}

export function enrichParks(parks: Park[]): Park[] {
  return parks.map(mergeParkVerification);
}