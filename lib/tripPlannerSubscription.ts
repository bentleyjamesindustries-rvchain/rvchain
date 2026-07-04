/** @deprecated Use @/lib/membershipSubscription */
import type { MembershipPlanId } from './membershipPlans';
import type { BillingInterval } from './membershipPlans';
import {
  getMembershipSubscription,
  getMembershipPlanId,
  subscribeToMembership,
  cancelMembership,
  type MembershipSubscription,
} from './membershipSubscription';

export type TripPlannerSubscription = MembershipSubscription;

export function getTripPlannerSubscription(userId: string): TripPlannerSubscription | null {
  return getMembershipSubscription(userId);
}

export function getTripPlannerPlanId(userId?: string | null): MembershipPlanId {
  return getMembershipPlanId(userId);
}

export function subscribeToTripPlanner(
  userId: string,
  plan: MembershipPlanId,
  billingInterval: BillingInterval = 'monthly',
  startTrial = false
): TripPlannerSubscription {
  return subscribeToMembership(userId, plan, billingInterval, { startTrial });
}

export function cancelTripPlannerSubscription(userId: string) {
  cancelMembership(userId);
}