import { isRvchainSubscriber, SELLER_MAX_ACTIVE_LISTINGS } from './rvSubscriptionStorage';
import { loadUserListingsOnly } from './rvMarketplaceStorage';

/** Low list fees — primary revenue is sale commission */
export const SINGLE_LISTING_PRICE = 14.99;
export const SINGLE_LISTING_RENEW_PRICE = 9.99;
export const SINGLE_LISTING_DAYS = 30;

export interface SellerListingCredit {
  id: string;
  userId: string;
  purchasedAt: string;
  durationDays: number;
  usedListingId: string | null;
  usedAt: string | null;
}

const CREDIT_KEY = 'rvchain_seller_listing_credits';

function loadCredits(): SellerListingCredit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CREDIT_KEY);
    return raw ? (JSON.parse(raw) as SellerListingCredit[]) : [];
  } catch {
    return [];
  }
}

function saveCredits(credits: SellerListingCredit[]) {
  localStorage.setItem(CREDIT_KEY, JSON.stringify(credits));
}

export function getUnusedListingCredits(userId: string): SellerListingCredit[] {
  return loadCredits().filter((c) => c.userId === userId && !c.usedListingId);
}

export function countUnusedListingCredits(userId: string): number {
  return getUnusedListingCredits(userId).length;
}

/** Demo purchase — no real charge */
export function purchaseSingleListingCredit(userId: string): SellerListingCredit {
  const credit: SellerListingCredit = {
    id: `credit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    purchasedAt: new Date().toISOString(),
    durationDays: SINGLE_LISTING_DAYS,
    usedListingId: null,
    usedAt: null,
  };
  saveCredits([credit, ...loadCredits()]);
  return credit;
}

export function consumeListingCredit(
  userId: string,
  listingId: string
): SellerListingCredit | null {
  const credits = loadCredits();
  const idx = credits.findIndex((c) => c.userId === userId && !c.usedListingId);
  if (idx < 0) return null;
  credits[idx] = {
    ...credits[idx],
    usedListingId: listingId,
    usedAt: new Date().toISOString(),
  };
  saveCredits(credits);
  return credits[idx];
}

export type PublishAccess = 'seller-pro' | 'single-credit' | 'none';

export function getPublishAccess(userId?: string | null): PublishAccess {
  if (!userId) return 'none';
  if (isRvchainSubscriber(userId)) return 'seller-pro';
  if (countUnusedListingCredits(userId) > 0) return 'single-credit';
  return 'none';
}

export function canPublishListing(userId?: string | null): boolean {
  return getPublishAccess(userId) !== 'none';
}

export function canPublishAnotherListing(userId: string): { ok: boolean; error?: string } {
  const access = getPublishAccess(userId);
  if (access === 'none') {
    return { ok: false, error: 'Buy a single listing or activate Seller Pro to publish.' };
  }
  if (access === 'seller-pro') {
    const active = loadUserListingsOnly(userId).filter(
      (l) => (l.status ?? 'active') !== 'sold' && (l.status ?? 'active') !== 'expired'
    );
    if (active.length >= SELLER_MAX_ACTIVE_LISTINGS) {
      return {
        ok: false,
        error: `Seller Pro allows up to ${SELLER_MAX_ACTIVE_LISTINGS} active listings.`,
      };
    }
  }
  return { ok: true };
}

export function listingExpiresAt(fromDate: Date, durationDays: number): string {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + durationDays);
  return d.toISOString();
}
