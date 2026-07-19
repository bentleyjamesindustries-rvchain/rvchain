/** Platform commission — UI shows % only + seller net; feeAmount is internal. */

export const MARKETPLACE_FEE_BANDS = [
  { maxPrice: 30_000, percent: 4.5 },
  { maxPrice: 75_000, percent: 3.5 },
  { maxPrice: 125_000, percent: 2.9 },
  { maxPrice: Infinity, percent: 2.5 },
] as const;

export interface MarketplaceFeeQuote {
  grossPrice: number;
  feePercent: number;
  /** Internal accounting only — do not show as platform take in main UI */
  feeAmount: number;
  sellerNet: number;
}

export function getMarketplaceFeePercent(grossPrice: number): number {
  if (!Number.isFinite(grossPrice) || grossPrice <= 0) return MARKETPLACE_FEE_BANDS[0].percent;
  for (const band of MARKETPLACE_FEE_BANDS) {
    if (grossPrice < band.maxPrice) return band.percent;
  }
  return 2.5;
}

export function quoteMarketplaceFee(grossPrice: number): MarketplaceFeeQuote {
  const price = Math.max(0, Math.round(grossPrice));
  const feePercent = getMarketplaceFeePercent(price);
  const feeAmount = Math.round((price * feePercent) / 100);
  const sellerNet = Math.max(0, price - feeAmount);
  return { grossPrice: price, feePercent, feeAmount, sellerNet };
}

export function formatFeePercent(percent: number): string {
  return `${percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(1)}%`;
}

export function formatSellerPayout(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function feeScheduleSummary(): string {
  return [
    `Under $30k: ${formatFeePercent(4.5)}`,
    `$30k–$75k: ${formatFeePercent(3.5)}`,
    `$75k–$125k: ${formatFeePercent(2.9)}`,
    `$125k+: ${formatFeePercent(2.5)}`,
  ].join(' · ');
}
