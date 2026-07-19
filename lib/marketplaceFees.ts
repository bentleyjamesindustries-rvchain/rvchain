/** Platform commission by marketplace category. UI: % + seller net only. */

export type MarketplaceItemType = 'rv' | 'gear' | 'parts';

export interface MarketplaceFeeQuote {
  grossPrice: number;
  feePercent: number;
  /** Internal only — do not show as platform take in main UI */
  feeAmount: number;
  sellerNet: number;
  itemType: MarketplaceItemType;
}

const RV_BANDS = [
  { maxPrice: 30_000, percent: 4.5 },
  { maxPrice: 75_000, percent: 3.5 },
  { maxPrice: 125_000, percent: 2.9 },
  { maxPrice: Infinity, percent: 2.5 },
] as const;

const GEAR_BANDS = [
  { maxPrice: 50, percent: 10 },
  { maxPrice: 200, percent: 9 },
  { maxPrice: 1_000, percent: 8 },
  { maxPrice: Infinity, percent: 6.5 },
] as const;

const PARTS_BANDS = [
  { maxPrice: 75, percent: 12 },
  { maxPrice: 250, percent: 10 },
  { maxPrice: 750, percent: 8 },
  { maxPrice: Infinity, percent: 6 },
] as const;

function percentFromBands(
  price: number,
  bands: readonly { maxPrice: number; percent: number }[]
): number {
  for (const band of bands) {
    if (price < band.maxPrice) return band.percent;
  }
  return bands[bands.length - 1].percent;
}

export function getMarketplaceFeePercent(
  grossPrice: number,
  itemType: MarketplaceItemType = 'rv'
): number {
  if (!Number.isFinite(grossPrice) || grossPrice <= 0) {
    if (itemType === 'gear') return 10;
    if (itemType === 'parts') return 12;
    return 4.5;
  }
  if (itemType === 'gear') return percentFromBands(grossPrice, GEAR_BANDS);
  if (itemType === 'parts') return percentFromBands(grossPrice, PARTS_BANDS);
  return percentFromBands(grossPrice, RV_BANDS);
}

export function quoteMarketplaceFee(
  grossPrice: number,
  itemType: MarketplaceItemType = 'rv'
): MarketplaceFeeQuote {
  const price = Math.max(0, Math.round(grossPrice * 100) / 100);
  const feePercent = getMarketplaceFeePercent(price, itemType);
  const feeAmount = Math.round((price * feePercent) / 100 * 100) / 100;
  const sellerNet = Math.max(0, Math.round((price - feeAmount) * 100) / 100);
  return { grossPrice: price, feePercent, feeAmount, sellerNet, itemType };
}

export function formatFeePercent(percent: number): string {
  return `${percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(1)}%`;
}

export function formatSellerPayout(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount < 100 ? 2 : 0,
  }).format(amount);
}

export function feeScheduleSummary(itemType: MarketplaceItemType): string {
  if (itemType === 'gear') {
    return [
      `Under $50: ${formatFeePercent(10)}`,
      `$50–$200: ${formatFeePercent(9)}`,
      `$200–$1k: ${formatFeePercent(8)}`,
      `$1k+: ${formatFeePercent(6.5)}`,
    ].join(' · ');
  }
  if (itemType === 'parts') {
    return [
      `Under $75: ${formatFeePercent(12)}`,
      `$75–$250: ${formatFeePercent(10)}`,
      `$250–$750: ${formatFeePercent(8)}`,
      `$750+: ${formatFeePercent(6)}`,
    ].join(' · ');
  }
  return [
    `Under $30k: ${formatFeePercent(4.5)}`,
    `$30k–$75k: ${formatFeePercent(3.5)}`,
    `$75k–$125k: ${formatFeePercent(2.9)}`,
    `$125k+: ${formatFeePercent(2.5)}`,
  ].join(' · ');
}

export function itemTypeLabel(itemType: MarketplaceItemType): string {
  if (itemType === 'gear') return 'Camping gear';
  if (itemType === 'parts') return 'Parts';
  return 'RV';
}
