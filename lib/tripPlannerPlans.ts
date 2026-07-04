import type { ChecklistPackId } from './tripChecklists';

export type TripPlannerPlanId = 'free' | 'explorer' | 'navigator' | 'trailmaster';

export interface TripPlannerPlan {
  id: TripPlannerPlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  priceMonthly: number;
  features: string[];
  checklistPacks: ChecklistPackId[] | 'pick-one' | 'all';
  maxTripsWithChecklists: number | 'unlimited';
  printable: boolean;
  routeSummary: boolean;
  survivalTips: boolean;
  accent: string;
}

export const TRIP_PLANNER_PLANS: TripPlannerPlan[] = [
  {
    id: 'free',
    name: 'Trip List',
    tagline: 'Name your trip and save park stops',
    priceLabel: 'Free',
    priceMonthly: 0,
    features: ['Trip name & dates', 'Park stop list', 'Quick add from Discover'],
    checklistPacks: [],
    maxTripsWithChecklists: 0,
    printable: false,
    routeSummary: false,
    survivalTips: false,
    accent: 'text-slate-400',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    tagline: 'One checklist pack per trip',
    priceLabel: '$4.99/mo',
    priceMonthly: 4.99,
    features: ['Everything in Trip List', 'Pick 1 camper checklist pack', 'Trip notes', 'Printable checklist'],
    checklistPacks: 'pick-one',
    maxTripsWithChecklists: 'unlimited',
    printable: true,
    routeSummary: false,
    survivalTips: false,
    accent: 'text-emerald-400',
  },
  {
    id: 'navigator',
    name: 'Navigator',
    tagline: 'Full planning for every trip',
    priceLabel: '$9.99/mo',
    priceMonthly: 9.99,
    features: [
      'All checklist packs per trip',
      'Vehicle prep list',
      'Route stop summary',
      'Print / save checklists',
    ],
    checklistPacks: 'all',
    maxTripsWithChecklists: 'unlimited',
    printable: true,
    routeSummary: true,
    survivalTips: false,
    accent: 'text-sky-400',
  },
  {
    id: 'trailmaster',
    name: 'Trailmaster',
    tagline: 'Complete off-grid & multi-trip planning',
    priceLabel: '$14.99/mo',
    priceMonthly: 14.99,
    features: [
      'Everything in Navigator',
      'Survival & boondocking tips',
      'Multi-trip dashboard',
      'Priority checklist sections',
    ],
    checklistPacks: 'all',
    maxTripsWithChecklists: 'unlimited',
    printable: true,
    routeSummary: true,
    survivalTips: true,
    accent: 'text-amber-400',
  },
];

const PLAN_MAP = new Map(TRIP_PLANNER_PLANS.map((p) => [p.id, p]));

export function getTripPlannerPlan(id: TripPlannerPlanId): TripPlannerPlan {
  return PLAN_MAP.get(id) ?? PLAN_MAP.get('free')!;
}

export function getEffectivePlanId(
  subscribedPlan: TripPlannerPlanId | null
): TripPlannerPlanId {
  return subscribedPlan ?? 'free';
}

export function canAccessChecklist(
  planId: TripPlannerPlanId,
  packId: ChecklistPackId,
  selectedPacks: ChecklistPackId[]
): boolean {
  const plan = getTripPlannerPlan(planId);
  if (plan.id === 'free') return false;
  if (plan.checklistPacks === 'all') return true;
  if (plan.checklistPacks === 'pick-one') return selectedPacks.includes(packId);
  return false;
}

export function maxSelectablePacks(planId: TripPlannerPlanId): number {
  const plan = getTripPlannerPlan(planId);
  if (plan.checklistPacks === 'pick-one') return 1;
  if (plan.checklistPacks === 'all') return 5;
  return 0;
}

export function availablePacksForPlan(planId: TripPlannerPlanId): ChecklistPackId[] {
  if (planId === 'free') return [];
  if (planId === 'explorer') return ['backpacking', 'car-camping', 'rv-drivable'];
  if (planId === 'navigator') return ['backpacking', 'car-camping', 'rv-drivable', 'vehicle-prep'];
  return ['backpacking', 'car-camping', 'rv-drivable', 'vehicle-prep', 'survival'];
}

export function planRank(id: TripPlannerPlanId): number {
  const order: TripPlannerPlanId[] = ['free', 'explorer', 'navigator', 'trailmaster'];
  return order.indexOf(id);
}