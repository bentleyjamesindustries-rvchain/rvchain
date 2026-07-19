import type { MarketplaceItemType } from './marketplaceFees';
import { isRvchainSubscriber, SELLER_MAX_ACTIVE_LISTINGS } from './rvSubscriptionStorage';
import { loadUserListingsOnly } from './rvMarketplaceStorage';
import { loadUserGearListingsOnly } from './gearMarketplaceStorage';
import { loadUserPartsListingsOnly } from './partsMarketplaceStorage';

/** RV list fee */
export const RV_SINGLE_LISTING_PRICE = 14.99;
/** Gear (primary non-vehicle) — cheapest */
export const GEAR_SINGLE_LISTING_PRICE = 1.99;
/** Parts secondary */
export const PARTS_SINGLE_LISTING_PRICE = 2.99;

export const SINGLE_LISTING_DAYS = 30;

/** @deprecated use type-specific prices */
export const SINGLE_LISTING_PRICE = RV_SINGLE_LISTING_PRICE;

export interface SellerListingCredit {
  id: string;
  userId: string;
  itemType: MarketplaceItemType;
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
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<SellerListingCredit>>;
    return parsed.map((c) => ({
      id: c.id ?? `credit-${Math.random()}`,
      userId: c.userId ?? '',
      itemType: (c.itemType as MarketplaceItemType) ?? 'rv',
      purchasedAt: c.purchasedAt ?? new Date().toISOString(),
      durationDays: c.durationDays ?? SINGLE_LISTING_DAYS,
      usedListingId: c.usedListingId ?? null,
      usedAt: c.usedAt ?? null,
    }));
  } catch {
    return [];
  }
}

function saveCredits(credits: SellerListingCredit[]) {
  localStorage.setItem(CREDIT_KEY, JSON.stringify(credits));
}

export function singleListingPrice(itemType: MarketplaceItemType): number {
  if (itemType === 'gear') return GEAR_SINGLE_LISTING_PRICE;
  if (itemType === 'parts') return PARTS_SINGLE_LISTING_PRICE;
  return RV_SINGLE_LISTING_PRICE;
}

export function getUnusedListingCredits(
  userId: string,
  itemType?: MarketplaceItemType
): SellerListingCredit[] {
  return loadCredits().filter(
    (c) =>
      c.userId === userId &&
      !c.usedListingId &&
      (itemType ? c.itemType === itemType : true)
  );
}

export function countUnusedListingCredits(
  userId: string,
  itemType?: MarketplaceItemType
): number {
  return getUnusedListingCredits(userId, itemType).length;
}

export function purchaseSingleListingCredit(
  userId: string,
  itemType: MarketplaceItemType
): SellerListingCredit {
  const credit: SellerListingCredit = {
    id: `credit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    itemType,
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
  listingId: string,
  itemType: MarketplaceItemType
): SellerListingCredit | null {
  const credits = loadCredits();
  const idx = credits.findIndex(
    (c) => c.userId === userId && !c.usedListingId && c.itemType === itemType
  );
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

export function getPublishAccess(
  userId?: string | null,
  itemType: MarketplaceItemType = 'rv'
): PublishAccess {
  if (!userId) return 'none';
  if (isRvchainSubscriber(userId)) return 'seller-pro';
  if (countUnusedListingCredits(userId, itemType) > 0) return 'single-credit';
  return 'none';
}

export function canPublishListing(
  userId?: string | null,
  itemType: MarketplaceItemType = 'rv'
): boolean {
  return getPublishAccess(userId, itemType) !== 'none';
}

function activeCountAll(userId: string): number {
  const rvs = loadUserListingsOnly(userId).filter(
    (l) => (l.status ?? 'active') !== 'sold' && (l.status ?? 'active') !== 'expired'
  ).length;
  const gear = loadUserGearListingsOnly(userId).filter(
    (l) => (l.status ?? 'active') !== 'sold' && (l.status ?? 'active') !== 'expired'
  ).length;
  const parts = loadUserPartsListingsOnly(userId).filter(
    (l) => (l.status ?? 'active') !== 'sold' && (l.status ?? 'active') !== 'expired'
  ).length;
  return rvs + gear + parts;
}

export function canPublishAnotherListing(
  userId: string,
  itemType: MarketplaceItemType
): { ok: boolean; error?: string } {
  const access = getPublishAccess(userId, itemType);
  if (access === 'none') {
    return {
      ok: false,
      error: `Buy a ${itemType === 'rv' ? 'RV' : itemType} listing or activate Seller Pro.`,
    };
  }
  if (access === 'seller-pro' && activeCountAll(userId) >= SELLER_MAX_ACTIVE_LISTINGS) {
    return {
      ok: false,
      error: `Seller Pro allows up to ${SELLER_MAX_ACTIVE_LISTINGS} active listings total.`,
    };
  }
  return { ok: true };
}

export function listingExpiresAt(fromDate: Date, durationDays: number): string {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + durationDays);
  return d.toISOString();
}
