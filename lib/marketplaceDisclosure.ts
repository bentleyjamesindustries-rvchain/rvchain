import { feeScheduleSummary } from './marketplaceFees';

export const MARKETPLACE_DISCLOSURE = {
  title: 'rvchain Marketplace Disclosure',
  summary:
    'rvchain is a marketplace for private-party RVs, camping gear, and parts. We are not a vehicle dealer and do not transfer titles. Demo mode — no real charges or payouts until Stripe is live.',
  bullets: [
    'Listings are separated: RVs (vehicles), Camping gear & accessories, and Parts. Different list fees and sale fee % schedules apply by type.',
    'rvchain is not a motor vehicle dealer; we do not inspect units or guarantee condition, mileage, liens, title, or fitment of parts.',
    'RV sales: title, registration, taxes, and transport are between buyer and seller. Gear and parts are personal property sold as-is unless the seller states otherwise.',
    'Parts: fitment is the buyer’s responsibility. Platform does not claim OEM affiliation.',
    `RV sale fees: ${feeScheduleSummary('rv')}.`,
    `Gear sale fees: ${feeScheduleSummary('gear')}.`,
    `Parts sale fees: ${feeScheduleSummary('parts')}.`,
    'Buyers see the sale price and that a marketplace fee % applies to the seller. The estimated seller payout is shown only to the seller (e.g. when listing or viewing their own ads).',
    'Low list fees: RV single, gear single, or parts single — or Seller Pro ($12.99/mo) for unlimited listings.',
    'Demo mode: fees and checkout are simulated on this device until live billing is enabled.',
  ],
  footer:
    'This notice is product information, not legal advice. Have counsel review before live payments and payouts.',
} as const;
