import { feeScheduleSummary } from './marketplaceFees';

export const MARKETPLACE_DISCLOSURE = {
  title: 'rvchain Marketplace Disclosure',
  summary:
    'rvchain Market is listing software for private-party RVs, gear, and parts. We are not a vehicle dealer, do not hold funds, and do not transfer titles. Buyers contact sellers; payment and delivery happen off-platform unless we later offer optional paid closing tools.',
  bullets: [
    'Listings are separated: RVs, Camping gear, and Parts — with different list fees by type.',
    'Seller Pro ($12.99/mo demo) is unlimited listing software: publish ads, get inquiries, optional certify/boost tools — not escrow or payment processing.',
    'Single listing credits are one-off publish rights for a limited number of days.',
    'rvchain does not inspect units or guarantee condition, mileage, liens, title, or parts fitment.',
    'RV sales: title, registration, taxes, and transport are between buyer and seller (and their DMV / dealer if any).',
    'Gear and parts are personal property sold as-is unless the seller states otherwise.',
    'Buyers use Contact seller to express interest. Off-platform payment is between the parties.',
    'If a future paid close through rvchain ships, fees would be disclosed then; reference schedules today are planning only: ' +
      `RV ${feeScheduleSummary('rv')}; gear ${feeScheduleSummary('gear')}; parts ${feeScheduleSummary('parts')}.`,
    'Demo mode: list fees, Seller Pro, and interest messages are simulated on this device until live billing is enabled.',
  ],
  footer:
    'This notice is product information, not legal advice. Have counsel review before live payments.',
} as const;
