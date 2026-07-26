import { feeScheduleSummary } from './marketplaceFees';

export const MARKETPLACE_DISCLOSURE = {
  title: 'rvchain Marketplace Disclosure',
  summary:
    'rvchain Market is listing software for private-party camping gear and RV parts. We are not a vehicle dealer, do not sell RVs, do not hold funds, and do not transfer titles. Buyers contact sellers; payment and delivery happen off-platform.',
  bullets: [
    'Listings are gear and parts only — personal property, not motor vehicles or trailers as whole units.',
    'Seller Pro ($12.99/mo demo) is unlimited listing software: publish ads and get inquiries — not escrow or payment processing.',
    'Single listing credits are one-off publish rights for a limited number of days.',
    'rvchain charges for listing software access (list fees / Seller Pro), not a commission on off-site sales.',
    'rvchain does not inspect items or guarantee condition, fitment, or authenticity.',
    'Gear and parts are sold as-is unless the seller states otherwise. Fitment is the buyer’s responsibility.',
    'Buyers use Contact seller to express interest. Off-platform payment is between the parties.',
    'Reference fee schedules (planning only): gear ' +
      feeScheduleSummary('gear') +
      '; parts ' +
      feeScheduleSummary('parts') +
      '.',
    'Demo mode: list fees, Seller Pro, and interest messages are simulated on this device until live billing is enabled.',
    'Sample listings use fictional names and Grok Imagine art — not real products or third-party brands.',
    'rvchain is not a campground directory and is not affiliated with any manufacturer or retailer.',
  ],
  footer:
    'This notice is product information, not legal advice. Have counsel review before live payments. Demo content is fictional sample data only.',
} as const;
