import { feeScheduleSummary } from './marketplaceFees';

export const MARKETPLACE_DISCLOSURE = {
  title: 'rvchain Marketplace Disclosure',
  summary:
    'rvchain is a marketplace for private-party RV listings and (when enabled) payment processing. We are not a vehicle dealer and do not transfer titles. Demo mode — no real charges or payouts until Stripe is live.',
  bullets: [
    'rvchain lists RVs and may process payments; we are not a motor vehicle dealer, do not inspect units, and do not guarantee condition, mileage, liens, or title.',
    'Sales are generally private party and as-is unless the seller states otherwise. Buyers should arrange independent inspection and title checks.',
    'Title transfer, registration, taxes, and transport are between buyer and seller (and agencies) — not performed by rvchain.',
    'Listing fees (single listing or Seller Pro) are low-cost advertising. When a sale completes through rvchain checkout, a marketplace fee applies as a percentage of the sale price; you see the rate (%) and what the seller receives before confirm.',
    `Sale fee schedule: ${feeScheduleSummary()}.`,
    'Deals closed off-platform (contact only) are at the parties’ own risk and may not include platform payment handling.',
    'Sellers must be 18+, own the RV or be authorized to sell, and list accurately. Stolen or illegal listings are prohibited.',
    'Demo mode: checkout and fees are simulated on this device. No real payment or seller bank transfer until live billing is enabled.',
  ],
  footer:
    'This notice is product information, not legal advice. Have counsel review before live payments and payouts.',
} as const;
