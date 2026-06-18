import {
  createEmptyUnifiedRewards,
  migrateRewardsData,
  UnifiedRewardsData,
  getActivePoints,
} from './rewardsProfile';
import type { RewardProgramId } from './rewardPrograms';

const GUEST_KEY = 'rvchain_rewards_guest';

function storageKey(userId: string) {
  return `rvchain_rewards_${userId}`;
}

export function loadUnifiedRewards(userId: string): UnifiedRewardsData {
  if (typeof window === 'undefined') return createEmptyUnifiedRewards();
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return createEmptyUnifiedRewards();
    return migrateRewardsData(JSON.parse(raw));
  } catch {
    return createEmptyUnifiedRewards();
  }
}

export function saveUnifiedRewards(userId: string, data: UnifiedRewardsData) {
  localStorage.setItem(storageKey(userId), JSON.stringify(data));
}

export function setActiveProgram(userId: string, program: RewardProgramId): UnifiedRewardsData {
  const data = loadUnifiedRewards(userId);
  data.activeProgram = program;
  saveUnifiedRewards(userId, data);
  return data;
}

/** @deprecated Use loadUnifiedRewards */
export function loadRewardsProfile(userId: string) {
  return loadUnifiedRewards(userId).mileage;
}

/** @deprecated Use saveUnifiedRewards */
export function saveRewardsProfile(userId: string, mileage: UnifiedRewardsData['mileage']) {
  const data = loadUnifiedRewards(userId);
  data.mileage = mileage;
  saveUnifiedRewards(userId, data);
}

export function getRewardsUserId(signedInUserId?: string | null): string {
  if (signedInUserId) return signedInUserId;
  if (typeof window === 'undefined') return 'guest';
  let guestId = localStorage.getItem(GUEST_KEY);
  if (!guestId) {
    guestId = `guest-${Date.now()}`;
    localStorage.setItem(GUEST_KEY, guestId);
  }
  return guestId;
}

export { getActivePoints };