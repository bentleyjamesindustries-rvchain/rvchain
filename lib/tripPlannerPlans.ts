/** @deprecated Use @/lib/membershipPlans — kept for import compatibility */
export type {
  MembershipPlanId as TripPlannerPlanId,
} from './membershipPlans';

export {
  MEMBERSHIP_PLANS as TRIP_PLANNER_PLANS,
  getMembershipPlan as getTripPlannerPlan,
  canAccessChecklist,
  maxSelectablePacks,
  availablePacksForPlan,
  planRank,
  formatPlanPrice,
} from './membershipPlans';

export { getEffectiveMembershipPlanId as getEffectivePlanId } from './membershipSubscription';

import type { MembershipPlanId } from './membershipPlans';

export function getTripPlannerPlanIdFromMembership(planId: MembershipPlanId): MembershipPlanId {
  return planId;
}