import type { Metadata } from 'next';
import MarketingPage from '@/components/MarketingPage';

export const metadata: Metadata = {
  title: 'Terms of Use — rvchain',
  description:
    'Terms for using rvchain, a no-escrow private-party gear and parts marketplace.',
};

export default function TermsPage() {
  return (
    <MarketingPage title="Terms of Use">
      <p className="text-xs text-slate-500">Last updated: July 2026</p>
      <p>
        By using rv-chain.com you agree to these terms. rvchain is operated by RV Chain LLC.
      </p>
      <h2 className="text-xl font-semibold text-white pt-4">What rvchain is</h2>
      <p>
        rvchain is a listing board for private-party camping gear and RV-related parts. We are not a
        campground directory, not a vehicle dealer, and not a party to sales between users.
      </p>
      <h2 className="text-xl font-semibold text-white pt-4">Listings &amp; conduct</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>You must own (or be authorized to sell) items you list.</li>
        <li>Listings must be accurate. No illegal, stolen, or prohibited items.</li>
        <li>Do not use third-party trademarks in a confusing or infringing way.</li>
        <li>We may remove listings or suspend accounts that violate these terms.</li>
      </ul>
      <h2 className="text-xl font-semibold text-white pt-4">No escrow · off-platform deals</h2>
      <p>
        Buyers contact sellers directly. Payment, shipping, title (if any), taxes, and disputes are
        solely between the parties. rvchain does not hold funds, guarantee condition, or mediate
        deals.
      </p>
      <h2 className="text-xl font-semibold text-white pt-4">Seller Pro &amp; fees</h2>
      <p>
        Free accounts may be limited in the number of active listings. Seller Pro or paid features
        (when offered) are for listing software access — not a commission on your private sale
        unless we clearly state otherwise.
      </p>
      <h2 className="text-xl font-semibold text-white pt-4">Disclaimer</h2>
      <p>
        The service is provided “as is.” We are not liable for user content, off-platform
        transactions, or losses arising from reliance on listings. Some jurisdictions do not allow
        certain limitations; rights may vary.
      </p>
      <h2 className="text-xl font-semibold text-white pt-4">Contact</h2>
      <p>
        <a href="mailto:hello@rv-chain.com" className="text-sky-400 underline">hello@rv-chain.com</a>
      </p>
    </MarketingPage>
  );
}
