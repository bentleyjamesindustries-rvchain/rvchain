import type { ChecklistPackId } from './tripChecklists';

export type MembershipPlanId = 'campfire' | 'weekender' | 'road-tripper' | 'full-timer';

export type BillingInterval = 'monthly' | 'annual';

export interface MembershipPlan {
  id: MembershipPlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  trialDays: number;
  features: string[];
  accent: string;
  /** Trip planner */
  maxActiveTrips: number | 'unlimited';
  checklistPacks: ChecklistPackId[] | 'pick-one' | 'all';
  printable: boolean;
  routeSummary: boolean;
  survivalTips: boolean;
  maintenanceReminders: boolean;
  /** Rewards */
  checkInBonusPercent: number;
  partnerSpotlightsPerMonth: number | 'unlimited';
  /** Forum */
  canPost: boolean;
  forumBadge: string | null;
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'campfire',
    name: 'Campfire',
    tagline: 'Community & map lite — upgrade for trips, forum posting & tools',
    priceMonthly: 0,
    priceAnnual: 0,
    trialDays: 0,
    features: [
      'Browse community park picks & map (sign-in)',
      'Kids adventure trail (explorer profiles)',
      'Browse RV marketplace',
      'Trips, forum posting & Road Crew: Weekender+',
    ],
    accent: 'text-slate-400',
    maxActiveTrips: 0,
    checklistPacks: [],
    printable: false,
    routeSummary: false,
    survivalTips: false,
    maintenanceReminders: false,
    checkInBonusPercent: 0,
    partnerSpotlightsPerMonth: 0,
    canPost: false,
    forumBadge: null,
  },
  {
    id: 'weekender',
    name: 'Weekender',
    tagline: 'Plan trips, post in the forum, pack smarter',
    priceMonthly: 5.99,
    priceAnnual: 59,
    trialDays: 7,
    features: [
      'Unlimited trip planner & park stops',
      'Pick 1 packing checklist pack per trip',
      'Printable checklists & trip notes',
      'Post in the camper forum',
      '+10% Road Crew earn boost',
    ],
    accent: 'text-emerald-400',
    maxActiveTrips: 'unlimited',
    checklistPacks: 'pick-one',
    printable: true,
    routeSummary: false,
    survivalTips: false,
    maintenanceReminders: false,
    checkInBonusPercent: 10,
    partnerSpotlightsPerMonth: 1,
    canPost: true,
    forumBadge: 'Weekender',
  },
  {
    id: 'road-tripper',
    name: 'Road Tripper',
    tagline: 'Full route planning for every stop on the road',
    priceMonthly: 10.99,
    priceAnnual: 99,
    trialDays: 0,
    features: [
      'All packing checklist packs per trip',
      'Vehicle prep & route stop summary',
      'Community arrival tips',
      'Road Tripper forum badge',
      '+15% Road Crew earn boost',
    ],
    accent: 'text-sky-400',
    maxActiveTrips: 'unlimited',
    checklistPacks: 'all',
    printable: true,
    routeSummary: true,
    survivalTips: false,
    maintenanceReminders: false,
    checkInBonusPercent: 15,
    partnerSpotlightsPerMonth: 3,
    canPost: true,
    forumBadge: 'Road Tripper',
  },
  {
    id: 'full-timer',
    name: 'Full Timer',
    tagline: 'RV life planning, boondocking, and maintenance',
    priceMonthly: 16.99,
    priceAnnual: 149,
    trialDays: 0,
    features: [
      'Everything in Road Tripper',
      'Survival & boondocking checklist',
      'Multi-trip dashboard',
      'RV maintenance reminders',
      'Full Timer forum badge',
      '+25% Road Crew earn boost',
    ],
    accent: 'text-amber-400',
    maxActiveTrips: 'unlimited',
    checklistPacks: 'all',
    printable: true,
    routeSummary: true,
    survivalTips: true,
    maintenanceReminders: true,
    checkInBonusPercent: 25,
    partnerSpotlightsPerMonth: 'unlimited',
    canPost: true,
    forumBadge: 'Full Timer',
  },
];

const PLAN_MAP = new Map(MEMBERSHIP_PLANS.map((p) => [p.id, p]));

const PLAN_ORDER: MembershipPlanId[] = ['campfire', 'weekender', 'road-tripper', 'full-timer'];

/** Legacy trip planner tier IDs → new membership IDs */
const LEGACY_PLAN_MAP: Record<string, MembershipPlanId> = {
  free: 'campfire',
  explorer: 'weekender',
  navigator: 'road-tripper',
  trailmaster: 'full-timer',
};

export function migrateLegacyPlanId(id: string): MembershipPlanId {
  if (PLAN_MAP.has(id as MembershipPlanId)) return id as MembershipPlanId;
  return LEGACY_PLAN_MAP[id] ?? 'campfire';
}

export function getMembershipPlan(id: MembershipPlanId): MembershipPlan {
  return PLAN_MAP.get(id) ?? PLAN_MAP.get('campfire')!;
}

export function planRank(id: MembershipPlanId): number {
  return PLAN_ORDER.indexOf(id);
}

export function isPaidPlan(id: MembershipPlanId): boolean {
  return id !== 'campfire';
}

export function formatPlanPrice(plan: MembershipPlan, interval: BillingInterval): string {
  if (plan.id === 'campfire') return 'Free';
  if (interval === 'annual') return `$${plan.priceAnnual}/yr`;
  return `$${plan.priceMonthly.toFixed(2)}/mo`;
}

export function canBrowseForum(userId?: string | null): boolean {
  return Boolean(userId);
}

export function canPostOnForum(planId: MembershipPlanId): boolean {
  return getMembershipPlan(planId).canPost;
}

export function getCheckInBonusMultiplier(planId: MembershipPlanId): number {
  const pct = getMembershipPlan(planId).checkInBonusPercent;
  return 1 + pct / 100;
}

export function applyMembershipCheckInBonus(
  basePoints: number,
  planId: MembershipPlanId
): number {
  return Math.round(basePoints * getCheckInBonusMultiplier(planId));
}

export function canAccessChecklist(
  planId: MembershipPlanId,
  packId: ChecklistPackId,
  selectedPacks: ChecklistPackId[]
): boolean {
  const plan = getMembershipPlan(planId);
  if (plan.id === 'campfire') return false;
  if (plan.checklistPacks === 'all') return true;
  if (plan.checklistPacks === 'pick-one') return selectedPacks.includes(packId);
  return false;
}

export function maxSelectablePacks(planId: MembershipPlanId): number {
  const plan = getMembershipPlan(planId);
  if (plan.checklistPacks === 'pick-one') return 1;
  if (plan.checklistPacks === 'all') return 6;
  return 0;
}

export function availablePacksForPlan(planId: MembershipPlanId): ChecklistPackId[] {
  if (planId === 'campfire') return [];
  if (planId === 'weekender') return ['backpacking', 'car-camping', 'rv-drivable', 'family-road'];
  if (planId === 'road-tripper') {
    return ['backpacking', 'car-camping', 'rv-drivable', 'vehicle-prep', 'family-road'];
  }
  return ['backpacking', 'car-camping', 'rv-drivable', 'vehicle-prep', 'survival', 'family-road'];
}

export function canUseTripPlanner(planId: MembershipPlanId): boolean {
  return planId !== 'campfire';
}

export function canEarnLoyaltyPoints(planId: MembershipPlanId): boolean {
  return planId !== 'campfire';
}

export function canCreateTrip(planId: MembershipPlanId, currentTripCount: number): boolean {
  if (!canUseTripPlanner(planId)) return false;
  const plan = getMembershipPlan(planId);
  if (plan.maxActiveTrips === 'unlimited') return true;
  return currentTripCount < plan.maxActiveTrips;
}