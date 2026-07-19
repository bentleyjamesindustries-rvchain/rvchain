export type RvchainPlanId = 'seller-pro';

export type SellerBillingInterval = 'monthly' | 'annual';

export interface RvchainSubscription {
  userId: string;
  plan: RvchainPlanId;
  active: boolean;
  billingInterval: SellerBillingInterval;
  subscribedAt: string;
  featuredUntil: string | null;
}

/** Competitive low Pro pricing — money is on sale commission */
export const SELLER_PRO_PRICE_MONTHLY = 12.99;
export const SELLER_PRO_PRICE_ANNUAL = 119;
export const SELLER_FEATURED_BOOST_DAYS = 7;
export const SELLER_FEATURED_BOOST_PRICE = 7.99;
export const SELLER_MAX_ACTIVE_LISTINGS = 10;

const KEY = 'rvchain_rv_subscriptions';

function loadAll(): Record<string, RvchainSubscription> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
    const out: Record<string, RvchainSubscription> = {};
    for (const [uid, val] of Object.entries(parsed)) {
      if (!val || val.active === false) continue;
      out[uid] = {
        userId: uid,
        plan: 'seller-pro',
        active: true,
        billingInterval: val.billingInterval === 'annual' ? 'annual' : 'monthly',
        subscribedAt:
          typeof val.subscribedAt === 'string' ? val.subscribedAt : new Date().toISOString(),
        featuredUntil: typeof val.featuredUntil === 'string' ? val.featuredUntil : null,
      };
    }
    return out;
  } catch {
    return {};
  }
}

function saveAll(all: Record<string, RvchainSubscription>) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getRvchainSubscription(userId: string): RvchainSubscription | null {
  const sub = loadAll()[userId];
  return sub?.active ? sub : null;
}

export function isRvchainSubscriber(userId?: string | null): boolean {
  if (!userId) return false;
  return Boolean(getRvchainSubscription(userId));
}

/** Demo: activate Seller Pro — no real billing */
export function subscribeToRvchainServices(
  userId: string,
  billingInterval: SellerBillingInterval = 'monthly'
): RvchainSubscription {
  const existing = getRvchainSubscription(userId);
  const sub: RvchainSubscription = {
    userId,
    plan: 'seller-pro',
    active: true,
    billingInterval,
    subscribedAt: existing?.subscribedAt ?? new Date().toISOString(),
    featuredUntil: existing?.featuredUntil ?? null,
  };
  const all = loadAll();
  all[userId] = sub;
  saveAll(all);
  return sub;
}

export function cancelRvchainSubscription(userId: string) {
  const all = loadAll();
  delete all[userId];
  saveAll(all);
}

export function isSellerFeaturedActive(userId?: string | null): boolean {
  if (!userId) return false;
  const sub = getRvchainSubscription(userId);
  if (!sub?.featuredUntil) return false;
  return new Date(sub.featuredUntil) > new Date();
}

export function purchaseFeaturedBoost(userId: string): RvchainSubscription | null {
  const sub = getRvchainSubscription(userId);
  if (!sub) return null;
  const base =
    sub.featuredUntil && new Date(sub.featuredUntil) > new Date()
      ? new Date(sub.featuredUntil)
      : new Date();
  base.setDate(base.getDate() + SELLER_FEATURED_BOOST_DAYS);
  const next: RvchainSubscription = { ...sub, featuredUntil: base.toISOString() };
  const all = loadAll();
  all[userId] = next;
  saveAll(all);
  return next;
}

export function formatSellerProPrice(interval: SellerBillingInterval): string {
  if (interval === 'annual') return `$${SELLER_PRO_PRICE_ANNUAL}/yr`;
  return `$${SELLER_PRO_PRICE_MONTHLY.toFixed(2)}/mo`;
}
