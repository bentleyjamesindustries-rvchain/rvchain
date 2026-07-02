export type RvchainPlanId = 'seller';

export interface RvchainSubscription {
  userId: string;
  plan: RvchainPlanId;
  active: boolean;
  subscribedAt: string;
}

const KEY = 'rvchain_rv_subscriptions';

function loadAll(): Record<string, RvchainSubscription> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getRvchainSubscription(userId: string): RvchainSubscription | null {
  const sub = loadAll()[userId];
  return sub?.active ? sub : null;
}

export function isRvchainSubscriber(userId?: string | null): boolean {
  if (!userId) return false;
  return Boolean(getRvchainSubscription(userId));
}

/** Demo: activate seller subscription locally — no real billing. */
export function subscribeToRvchainServices(userId: string): RvchainSubscription {
  const sub: RvchainSubscription = {
    userId,
    plan: 'seller',
    active: true,
    subscribedAt: new Date().toISOString(),
  };
  const all = loadAll();
  all[userId] = sub;
  localStorage.setItem(KEY, JSON.stringify(all));
  return sub;
}

export function cancelRvchainSubscription(userId: string) {
  const all = loadAll();
  delete all[userId];
  localStorage.setItem(KEY, JSON.stringify(all));
}