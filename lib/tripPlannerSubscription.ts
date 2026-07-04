import type { TripPlannerPlanId } from './tripPlannerPlans';

export interface TripPlannerSubscription {
  userId: string;
  plan: TripPlannerPlanId;
  active: boolean;
  subscribedAt: string;
}

const KEY = 'rvchain_trip_planner_subscriptions';

function loadAll(): Record<string, TripPlannerSubscription> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getTripPlannerSubscription(userId: string): TripPlannerSubscription | null {
  const sub = loadAll()[userId];
  return sub?.active ? sub : null;
}

export function getTripPlannerPlanId(userId?: string | null): TripPlannerPlanId {
  if (!userId) return 'free';
  return getTripPlannerSubscription(userId)?.plan ?? 'free';
}

/** Demo: activate trip planner subscription locally — no real billing. */
export function subscribeToTripPlanner(
  userId: string,
  plan: TripPlannerPlanId
): TripPlannerSubscription {
  if (plan === 'free') {
    cancelTripPlannerSubscription(userId);
    return { userId, plan: 'free', active: false, subscribedAt: new Date().toISOString() };
  }
  const sub: TripPlannerSubscription = {
    userId,
    plan,
    active: true,
    subscribedAt: new Date().toISOString(),
  };
  const all = loadAll();
  all[userId] = sub;
  localStorage.setItem(KEY, JSON.stringify(all));
  return sub;
}

export function cancelTripPlannerSubscription(userId: string) {
  const all = loadAll();
  delete all[userId];
  localStorage.setItem(KEY, JSON.stringify(all));
}