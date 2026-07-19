import { quoteMarketplaceFee } from './marketplaceFees';

export type MarketplaceSaleStatus = 'demo_completed' | 'pending' | 'paid' | 'payout_sent';

export interface MarketplaceSale {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerUserId: string;
  sellerUserId: string;
  grossPrice: number;
  feePercent: number;
  feeAmount: number;
  sellerNet: number;
  status: MarketplaceSaleStatus;
  buyerAcceptedTermsAt: string;
  createdAt: string;
}

const KEY = 'rvchain_marketplace_sales';

function loadAll(): MarketplaceSale[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MarketplaceSale[]) : [];
  } catch {
    return [];
  }
}

function saveAll(sales: MarketplaceSale[]) {
  localStorage.setItem(KEY, JSON.stringify(sales));
}

export function createDemoMarketplaceSale(input: {
  listingId: string;
  listingTitle: string;
  buyerUserId: string;
  sellerUserId: string;
  grossPrice: number;
}): MarketplaceSale {
  const quote = quoteMarketplaceFee(input.grossPrice);
  const sale: MarketplaceSale = {
    id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    listingId: input.listingId,
    listingTitle: input.listingTitle,
    buyerUserId: input.buyerUserId,
    sellerUserId: input.sellerUserId,
    grossPrice: quote.grossPrice,
    feePercent: quote.feePercent,
    feeAmount: quote.feeAmount,
    sellerNet: quote.sellerNet,
    status: 'demo_completed',
    buyerAcceptedTermsAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  saveAll([sale, ...loadAll()]);
  return sale;
}

export function getSalesForSeller(sellerUserId: string): MarketplaceSale[] {
  return loadAll().filter((s) => s.sellerUserId === sellerUserId);
}
