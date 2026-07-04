import type { BillingInterval, MembershipPlanId } from './membershipPlans';
import { getMembershipPlan, migrateLegacyPlanId } from './membershipPlans';

export interface MembershipSubscription {
  userId: string;
  plan: MembershipPlanId;
  billingInterval: BillingInterval;
  active: boolean;
  subscribedAt: string;
  trialEndsAt: string | null;
}

const KEY = 'rvchain_membership_subscriptions';
const LEGACY_KEY = 'rvchain_trip_planner_subscriptions';

function normalizeSub(raw: Record<string, unknown>): MembershipSubscription | null {
  if (!raw?.userId || typeof raw.userId !== 'string') return null;
  const plan = migrateLegacyPlanId(String(raw.plan ?? 'campfire'));
  const active = raw.active !== false;
  if (!active || plan === 'campfire') return null;

  let trialEndsAt: string | null =
    typeof raw.trialEndsAt === 'string' ? raw.trialEndsAt : null;

  if (!trialEndsAt && plan === 'weekender' && typeof raw.subscribedAt === 'string') {
    const trialDays = getMembershipPlan('weekender').trialDays;
    if (trialDays > 0) {
      const end = new Date(raw.subscribedAt);
      end.setDate(end.getDate() + trialDays);
      trialEndsAt = end.toISOString();
    }
  }

  return {
    userId: raw.userId,
    plan,
    billingInterval: raw.billingInterval === 'annual' ? 'annual' : 'monthly',
    active: true,
    subscribedAt: typeof raw.subscribedAt === 'string' ? raw.subscribedAt : new Date().toISOString(),
    trialEndsAt,
  };
}

function loadAll(): Record<string, MembershipSubscription> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: Record<string, unknown> = raw ? JSON.parse(raw) : {};
    const out: Record<string, MembershipSubscription> = {};
    for (const [uid, val] of Object.entries(parsed)) {
      const sub = normalizeSub({ ...(val as object), userId: uid });
      if (sub) out[uid] = sub;
    }
    if (Object.keys(out).length === 0) {
      migrateLegacyStorage();
      return loadAll();
    }
    return out;
  } catch {
    return {};
  }
}

function migrateLegacyStorage() {
  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (!legacyRaw) return;
    const legacy = JSON.parse(legacyRaw) as Record<string, Record<string, unknown>>;
    const migrated: Record<string, MembershipSubscription> = {};
    for (const [uid, val] of Object.entries(legacy)) {
      const sub = normalizeSub({ ...val, userId: uid });
      if (sub) migrated[uid] = sub;
    }
    if (Object.keys(migrated).length > 0) {
      localStorage.setItem(KEY, JSON.stringify(migrated));
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
}

function saveAll(all: Record<string, MembershipSubscription>) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getMembershipSubscription(userId: string): MembershipSubscription | null {
  const sub = loadAll()[userId];
  if (!sub?.active) return null;
  if (sub.trialEndsAt && new Date(sub.trialEndsAt) < new Date()) {
    return sub.plan === 'weekender' ? sub : sub;
  }
  return sub;
}

export function isMembershipActive(sub: MembershipSubscription | null): boolean {
  if (!sub?.active) return false;
  return sub.plan !== 'campfire';
}

export function isOnTrial(sub: MembershipSubscription | null): boolean {
  if (!sub?.trialEndsAt) return false;
  return new Date(sub.trialEndsAt) > new Date();
}

export function getMembershipPlanId(userId?: string | null): MembershipPlanId {
  if (!userId) return 'campfire';
  const sub = getMembershipSubscription(userId);
  return sub?.plan ?? 'campfire';
}

export function getEffectiveMembershipPlanId(userId?: string | null): MembershipPlanId {
  return getMembershipPlanId(userId);
}

/** Demo: activate membership locally — no real billing. */
export function subscribeToMembership(
  userId: string,
  plan: MembershipPlanId,
  billingInterval: BillingInterval = 'monthly',
  options?: { startTrial?: boolean }
): MembershipSubscription {
  if (plan === 'campfire') {
    cancelMembership(userId);
    return {
      userId,
      plan: 'campfire',
      billingInterval: 'monthly',
      active: false,
      subscribedAt: new Date().toISOString(),
      trialEndsAt: null,
    };
  }

  const now = new Date();
  let trialEndsAt: string | null = null;
  const trialDays = getMembershipPlan(plan).trialDays;
  if (options?.startTrial && trialDays > 0) {
    const end = new Date(now);
    end.setDate(end.getDate() + trialDays);
    trialEndsAt = end.toISOString();
  }

  const sub: MembershipSubscription = {
    userId,
    plan,
    billingInterval,
    active: true,
    subscribedAt: now.toISOString(),
    trialEndsAt,
  };
  const all = loadAll();
  all[userId] = sub;
  saveAll(all);
  return sub;
}

export function cancelMembership(userId: string) {
  const all = loadAll();
  delete all[userId];
  saveAll(all);
}