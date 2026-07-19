import { Park, calculateDistance } from './parks';
import {
  applyMembershipCheckInBonus,
  getMembershipPlan,
  type MembershipPlanId,
} from './membershipPlans';

export type RewardTierId = 'scout' | 'explorer' | 'navigator' | 'legend';

export type CheckInType = 'campsite' | 'boondocking';

export interface RewardTier {
  id: RewardTierId;
  name: string;
  minMiles: number;
  multiplier: number;
  color: string;
  perks: string[];
  exclusiveAccess: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'fuel' | 'propane' | 'gear';
  icon: string;
  tierRequired: RewardTierId;
}

export interface ActivityEntry {
  id: string;
  type: 'mileage' | 'checkin' | 'redemption';
  description: string;
  points: number;
  createdAt: string;
}

export interface RedemptionRecord {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  redeemedAt: string;
}

export interface RewardsProfile {
  totalMiles: number;
  totalPoints: number;
  sessionMiles: number;
  checkInCount: number;
  boondockCount: number;
  redeemedRewards: RedemptionRecord[];
  activityLog: ActivityEntry[];
  lastCheckIns: Record<string, string>;
}

export interface BoondockingSpot {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export const POINTS_PER_MILE = 10;
export const CAMPSITE_CHECKIN_POINTS = 250;
export const BOONDOCK_CHECKIN_POINTS = 150;
export const CHECKIN_COOLDOWN_HOURS = 24;
export const CHECKIN_RADIUS_MILES = 5;

export const REWARD_TIERS: RewardTier[] = [
  {
    id: 'scout',
    name: 'Scout',
    minMiles: 0,
    multiplier: 1,
    color: '#94a3b8',
    perks: ['Earn 10 pts/mile', 'Standard rewards catalog'],
    exclusiveAccess: 'Public campground listings',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    minMiles: 500,
    multiplier: 1.25,
    color: '#4ade80',
    perks: ['25% mileage bonus', 'Early access to gear deals'],
    exclusiveAccess: '48-hour early access to new park listings',
  },
  {
    id: 'navigator',
    name: 'Navigator',
    minMiles: 2000,
    multiplier: 1.5,
    color: '#38bdf8',
    perks: ['50% mileage bonus', 'Priority support', 'Exclusive campsite previews'],
    exclusiveAccess: 'Members-only campsite previews & partner discounts',
  },
  {
    id: 'legend',
    name: 'Open Road Legend',
    minMiles: 5000,
    multiplier: 2,
    color: '#fbbf24',
    perks: ['2× mileage bonus', 'VIP partner perks', 'Exclusive boondocking intel'],
    exclusiveAccess: 'VIP campsite access & invite-only rally events',
  },
];

export const REWARD_CATALOG: RewardItem[] = [
  { id: 'fuel-25', name: '$25 Fuel Credit (demo)', description: 'Fictional demo reward — not a real gift card or brand partner', pointsCost: 2500, category: 'fuel', icon: '⛽', tierRequired: 'scout' },
  { id: 'fuel-50', name: '$50 Fuel Credit (demo)', description: 'Fictional demo reward — no real redemption', pointsCost: 4500, category: 'fuel', icon: '⛽', tierRequired: 'explorer' },
  { id: 'propane-15', name: '$15 Propane Credit (demo)', description: 'Fictional demo reward — not a real propane partner', pointsCost: 1500, category: 'propane', icon: '🔥', tierRequired: 'scout' },
  { id: 'propane-30', name: '$30 Propane Credit (demo)', description: 'Fictional demo reward — no real refill credit', pointsCost: 2800, category: 'propane', icon: '🔥', tierRequired: 'navigator' },
  { id: 'gear-kit', name: 'Camping Gear Bundle', description: 'LED lantern, hose kit, leveling blocks', pointsCost: 5000, category: 'gear', icon: '🏕️', tierRequired: 'explorer' },
  { id: 'gear-premium', name: 'Premium RV Kit', description: 'Surge protector, water filter, tire gauge set', pointsCost: 8500, category: 'gear', icon: '🎒', tierRequired: 'legend' },
];

/** Fictional demo dispersed zones — not real public-land sites or agency places. */
export const BOONDOCKING_SPOTS: BoondockingSpot[] = [
  { id: 'bd1', name: 'Demo Open Flat Zone A', state: 'AZ', lat: 33.663, lng: -114.23 },
  { id: 'bd2', name: 'Demo Forest Road Pull-Off B', state: 'AZ', lat: 34.869, lng: -111.761 },
  { id: 'bd3', name: 'Demo Redrock Dispersed C', state: 'UT', lat: 38.573, lng: -109.55 },
  { id: 'bd4', name: 'Demo Desert Basin Camp D', state: 'CA', lat: 36.238, lng: -117.079 },
  { id: 'bd5', name: 'Demo River Bend Zone E', state: 'TX', lat: 29.25, lng: -103.25 },
  { id: 'bd6', name: 'Demo Coastal Forest Zone F', state: 'WA', lat: 47.802, lng: -123.604 },
];

const TIER_RANK: Record<RewardTierId, number> = {
  scout: 0,
  explorer: 1,
  navigator: 2,
  legend: 3,
};

export function createEmptyProfile(): RewardsProfile {
  return {
    totalMiles: 0,
    totalPoints: 0,
    sessionMiles: 0,
    checkInCount: 0,
    boondockCount: 0,
    redeemedRewards: [],
    activityLog: [],
    lastCheckIns: {},
  };
}

export function getTierForMiles(miles: number): RewardTier {
  let tier = REWARD_TIERS[0];
  for (const t of REWARD_TIERS) {
    if (miles >= t.minMiles) tier = t;
  }
  return tier;
}

export function getNextTier(current: RewardTier): RewardTier | null {
  const idx = REWARD_TIERS.findIndex((t) => t.id === current.id);
  return idx < REWARD_TIERS.length - 1 ? REWARD_TIERS[idx + 1] : null;
}

export function tierMeetsRequirement(userTier: RewardTierId, required: RewardTierId): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[required];
}

function logActivity(
  profile: RewardsProfile,
  type: ActivityEntry['type'],
  description: string,
  points: number
): ActivityEntry[] {
  const entry: ActivityEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    description,
    points,
    createdAt: new Date().toISOString(),
  };
  return [entry, ...profile.activityLog].slice(0, 50);
}

export function addMileagePoints(profile: RewardsProfile, miles: number): RewardsProfile {
  if (miles <= 0) return profile;

  const tier = getTierForMiles(profile.totalMiles);
  const points = Math.round(miles * POINTS_PER_MILE * tier.multiplier);

  return {
    ...profile,
    totalMiles: profile.totalMiles + miles,
    totalPoints: profile.totalPoints + points,
    activityLog: logActivity(
      profile,
      'mileage',
      `Drove ${miles.toFixed(1)} mi (${tier.multiplier}× ${tier.name} bonus)`,
      points
    ),
  };
}

export function canCheckIn(profile: RewardsProfile, locationId: string): boolean {
  const last = profile.lastCheckIns[locationId];
  if (!last) return true;
  const hoursSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60);
  return hoursSince >= CHECKIN_COOLDOWN_HOURS;
}

export function performCheckIn(
  profile: RewardsProfile,
  type: CheckInType,
  locationId: string,
  locationName: string,
  membershipPlanId: MembershipPlanId = 'campfire'
): { profile: RewardsProfile; points: number; error?: string } {
  if (!canCheckIn(profile, locationId)) {
    return { profile, points: 0, error: 'Already checked in here today. Come back tomorrow!' };
  }

  const tier = getTierForMiles(profile.totalMiles);
  const base = type === 'campsite' ? CAMPSITE_CHECKIN_POINTS : BOONDOCK_CHECKIN_POINTS;
  const tierPoints = Math.round(base * tier.multiplier);
  const points = applyMembershipCheckInBonus(tierPoints, membershipPlanId);
  const memberPlan = getMembershipPlan(membershipPlanId);
  const memberNote =
    memberPlan.checkInBonusPercent > 0
      ? `, +${memberPlan.checkInBonusPercent}% ${memberPlan.name} member bonus`
      : '';

  const updated: RewardsProfile = {
    ...profile,
    totalPoints: profile.totalPoints + points,
    checkInCount: type === 'campsite' ? profile.checkInCount + 1 : profile.checkInCount,
    boondockCount: type === 'boondocking' ? profile.boondockCount + 1 : profile.boondockCount,
    lastCheckIns: { ...profile.lastCheckIns, [locationId]: new Date().toISOString() },
    activityLog: logActivity(
      profile,
      'checkin',
      `Checked in at ${locationName} (${tier.name} tier${memberNote})`,
      points
    ),
  };

  return { profile: updated, points };
}

export function redeemReward(
  profile: RewardsProfile,
  reward: RewardItem
): { profile: RewardsProfile; success: boolean; error?: string } {
  const tier = getTierForMiles(profile.totalMiles);

  if (!tierMeetsRequirement(tier.id, reward.tierRequired)) {
    return { profile, success: false, error: `Requires ${REWARD_TIERS.find((t) => t.id === reward.tierRequired)?.name} tier` };
  }

  if (profile.totalPoints < reward.pointsCost) {
    return { profile, success: false, error: `Need ${reward.pointsCost - profile.totalPoints} more points` };
  }

  const redemption: RedemptionRecord = {
    id: `red-${Date.now()}`,
    rewardId: reward.id,
    rewardName: reward.name,
    pointsSpent: reward.pointsCost,
    redeemedAt: new Date().toISOString(),
  };

  return {
    profile: {
      ...profile,
      totalPoints: profile.totalPoints - reward.pointsCost,
      redeemedRewards: [redemption, ...profile.redeemedRewards],
      activityLog: logActivity(profile, 'redemption', `Redeemed ${reward.name}`, -reward.pointsCost),
    },
    success: true,
  };
}

export function findNearbyCheckInTargets(
  lat: number,
  lng: number,
  parks: Park[]
): { campsites: Park[]; boondocking: BoondockingSpot[] } {
  const campsites = parks.filter(
    (p) => p.lat != null && p.lng != null &&
      calculateDistance(lat, lng, p.lat, p.lng) <= CHECKIN_RADIUS_MILES
  );
  const boondocking = BOONDOCKING_SPOTS.filter(
    (b) => calculateDistance(lat, lng, b.lat, b.lng) <= CHECKIN_RADIUS_MILES
  );
  return { campsites, boondocking };
}

export function formatPoints(n: number): string {
  return n.toLocaleString();
}