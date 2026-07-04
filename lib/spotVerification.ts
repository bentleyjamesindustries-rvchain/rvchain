import type { Park } from './parks';

export interface ModeratorVerification {
  verifiedAt: string;
  verifiedBy: string;
}

export function getParkVerificationInfo(park: Park): ModeratorVerification | null {
  if (!park.verified && !park.verified_at) return null;
  return {
    verifiedAt: park.verified_at ?? new Date().toISOString(),
    verifiedBy: park.verified_by ?? 'rvchain moderator',
  };
}

export function createModeratorVerification(verifiedBy: string): ModeratorVerification {
  return {
    verifiedAt: new Date().toISOString(),
    verifiedBy,
  };
}