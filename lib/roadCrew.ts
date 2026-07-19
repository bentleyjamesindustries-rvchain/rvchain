import type { MembershipPlanId } from './membershipPlans';
import { getMembershipPlan, canEarnLoyaltyPoints } from './membershipPlans';
import type { ActivityEntry, RewardsProfile } from './rewards';
import { loadUnifiedRewards, saveUnifiedRewards, getRewardsUserId } from './rewardsStorage';

export type RoadCrewAction =
  | 'trip_created'
  | 'checklist_item'
  | 'forum_post'
  | 'market_list'
  | 'market_sale'
  | 'kids_plant_found';

export type RoadCrewTierId = 'camp-hand' | 'trail-mate' | 'road-regular' | 'crew-legend';

export interface RoadCrewTier {
  id: RoadCrewTierId;
  name: string;
  minPoints: number;
  multiplier: number;
  color: string;
  tagline: string;
}

export interface RoadCrewPerk {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: string;
  tierRequired: RoadCrewTierId;
  category: 'market' | 'kids' | 'profile' | 'trips';
}

/** Base points before membership multiplier */
export const ROAD_CREW_BASE: Record<RoadCrewAction, number> = {
  trip_created: 100,
  checklist_item: 5,
  forum_post: 50,
  market_list: 75,
  market_sale: 150,
  kids_plant_found: 25,
};

export const ROAD_CREW_ACTION_LABELS: Record<RoadCrewAction, string> = {
  trip_created: 'Created a trip',
  checklist_item: 'Checklist progress',
  forum_post: 'Forum post',
  market_list: 'Published a Market listing',
  market_sale: 'Marketplace sale (demo)',
  kids_plant_found: 'Kids plant found',
};

export const ROAD_CREW_TIERS: RoadCrewTier[] = [
  {
    id: 'camp-hand',
    name: 'Camp Hand',
    minPoints: 0,
    multiplier: 1,
    color: '#94a3b8',
    tagline: 'Just joined the crew',
  },
  {
    id: 'trail-mate',
    name: 'Trail Mate',
    minPoints: 400,
    multiplier: 1.1,
    color: '#4ade80',
    tagline: 'Active on the road',
  },
  {
    id: 'road-regular',
    name: 'Road Regular',
    minPoints: 1500,
    multiplier: 1.25,
    color: '#38bdf8',
    tagline: 'Full-time vibes',
  },
  {
    id: 'crew-legend',
    name: 'Crew Legend',
    minPoints: 4000,
    multiplier: 1.5,
    color: '#fbbf24',
    tagline: 'rvchain regular',
  },
];

/** On-platform perks — not fake fuel cards */
export const ROAD_CREW_PERKS: RoadCrewPerk[] = [
  {
    id: 'market-feature-day',
    name: '1-day Market featured boost',
    description: 'Highlight one of your Market listings for a day (demo grant).',
    pointsCost: 400,
    icon: '⭐',
    tierRequired: 'camp-hand',
    category: 'market',
  },
  {
    id: 'gear-list-credit',
    name: 'Gear listing credit',
    description: 'One demo gear listing credit for the Market (camping gear).',
    pointsCost: 350,
    icon: '🎒',
    tierRequired: 'trail-mate',
    category: 'market',
  },
  {
    id: 'kids-trail-pack',
    name: 'Kids trail pack',
    description: 'Unlock a bonus Kids trail pack spin (demo).',
    pointsCost: 250,
    icon: '🧭',
    tierRequired: 'camp-hand',
    category: 'kids',
  },
  {
    id: 'forum-flare',
    name: 'Forum name flare',
    description: 'Cosmetic Road Crew flare next to your forum handle (demo).',
    pointsCost: 200,
    icon: '✨',
    tierRequired: 'camp-hand',
    category: 'profile',
  },
  {
    id: 'checklist-boost',
    name: 'Extra checklist pack (1 trip)',
    description: 'Unlock an extra checklist pack on one trip (demo flag).',
    pointsCost: 500,
    icon: '✅',
    tierRequired: 'trail-mate',
    category: 'trips',
  },
  {
    id: 'parts-list-credit',
    name: 'Parts listing credit',
    description: 'One demo parts listing credit for the Market.',
    pointsCost: 300,
    icon: '🔧',
    tierRequired: 'trail-mate',
    category: 'market',
  },
];

const TIER_RANK: Record<RoadCrewTierId, number> = {
  'camp-hand': 0,
  'trail-mate': 1,
  'road-regular': 2,
  'crew-legend': 3,
};

export function getRoadCrewTier(totalPoints: number): RoadCrewTier {
  let tier = ROAD_CREW_TIERS[0];
  for (const t of ROAD_CREW_TIERS) {
    if (totalPoints >= t.minPoints) tier = t;
  }
  return tier;
}

export function getNextRoadCrewTier(current: RoadCrewTier): RoadCrewTier | null {
  const idx = ROAD_CREW_TIERS.findIndex((t) => t.id === current.id);
  return idx >= 0 && idx < ROAD_CREW_TIERS.length - 1 ? ROAD_CREW_TIERS[idx + 1] : null;
}

export function roadCrewTierMeets(userTier: RoadCrewTierId, required: RoadCrewTierId): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[required];
}

/** Membership bonus multiplies base action points (reuse plan check-in % as crew boost). */
export function membershipCrewMultiplier(planId: MembershipPlanId): number {
  const pct = getMembershipPlan(planId).checkInBonusPercent;
  return 1 + pct / 100;
}

function logActivity(
  profile: RewardsProfile,
  description: string,
  points: number
): ActivityEntry[] {
  const entry: ActivityEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'checkin',
    description,
    points,
    createdAt: new Date().toISOString(),
  };
  return [entry, ...profile.activityLog].slice(0, 50);
}

export function awardRoadCrewPoints(
  profile: RewardsProfile,
  action: RoadCrewAction,
  planId: MembershipPlanId,
  detail?: string
): { profile: RewardsProfile; points: number; error?: string } {
  if (!canEarnLoyaltyPoints(planId)) {
    return { profile, points: 0, error: 'Road Crew requires Weekender or higher.' };
  }
  const base = ROAD_CREW_BASE[action];
  const tier = getRoadCrewTier(profile.totalPoints);
  const mem = membershipCrewMultiplier(planId);
  const points = Math.round(base * tier.multiplier * mem);
  const label = ROAD_CREW_ACTION_LABELS[action];
  const description = detail ? `${label}: ${detail}` : label;

  return {
    profile: {
      ...profile,
      totalPoints: profile.totalPoints + points,
      activityLog: logActivity(profile, description, points),
    },
    points,
  };
}

/** Convenience: award and persist for a signed-in user */
export function awardRoadCrewForUser(
  userId: string | null | undefined,
  planId: MembershipPlanId,
  action: RoadCrewAction,
  detail?: string
): number {
  if (!userId || !canEarnLoyaltyPoints(planId)) return 0;
  const uid = getRewardsUserId(userId);
  const data = loadUnifiedRewards(uid);
  const { profile, points } = awardRoadCrewPoints(data.mileage, action, planId, detail);
  if (points <= 0) return 0;
  saveUnifiedRewards(uid, { ...data, activeProgram: 'mileage', mileage: profile });
  return points;
}

export function redeemRoadCrewPerk(
  profile: RewardsProfile,
  perk: RoadCrewPerk
): { profile: RewardsProfile; success: boolean; error?: string } {
  const tier = getRoadCrewTier(profile.totalPoints);
  if (!roadCrewTierMeets(tier.id, perk.tierRequired)) {
    return { profile, success: false, error: `Requires ${perk.tierRequired} tier.` };
  }
  if (profile.totalPoints < perk.pointsCost) {
    return { profile, success: false, error: 'Not enough points.' };
  }
  return {
    success: true,
    profile: {
      ...profile,
      totalPoints: profile.totalPoints - perk.pointsCost,
      redeemedRewards: [
        {
          id: `red-${Date.now()}`,
          rewardId: perk.id,
          rewardName: perk.name,
          pointsSpent: perk.pointsCost,
          redeemedAt: new Date().toISOString(),
        },
        ...profile.redeemedRewards,
      ].slice(0, 30),
      activityLog: logActivity(profile, `Redeemed: ${perk.name}`, -perk.pointsCost),
    },
  };
}

export function formatRoadCrewPoints(n: number): string {
  return n.toLocaleString();
}
