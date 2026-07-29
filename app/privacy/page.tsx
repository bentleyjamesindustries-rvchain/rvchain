import type { Metadata } from 'next';
import MarketingPage from '@/components/MarketingPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — rvchain',
  description: 'How rvchain handles your data for our private-party gear and parts marketplace.',
};

export default function PrivacyPage() {
  return (
    <MarketingPage title="Privacy Policy">
      <p className="text-xs text-slate-500">Last updated: July 2026</p>
      <p>
        RV Chain LLC (“rvchain”, “we”) operates rv-chain.com — a private-party gear and parts
        marketplace. This policy explains what we collect and how we use it.
      </p>
      <h2 className="text-xl font-semibold text-white pt-4">Information we collect</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Account data: email, password (hashed by our auth provider), display name.</li>
        <li>Listing data: titles, descriptions, prices, photos, city/state, contact preferences.</li>
        <li>Messages you send via the contact form.</li>
        <li>Basic analytics (if Google Analytics is enabled) such as pages visited and device type.</li>
      </ul>
      <h2 className="text-xl font-semibold text-white pt-4">How we use information</h2>
      <p>
        We use your data to run the marketplace: show listings, let buyers contact sellers, improve
        the product, and communicate about your account. We do not sell your personal information.
      </p>
      <h2 className="text-xl font-semibold text-white pt-4">Off-platform transactions</h2>
      <p>
        Sales and payments happen between users off-platform. We do not process buyer–seller
        payments and are not responsible for those private transactions.
      </p>
      <h2 className="text-xl font-semibold text-white pt-4">Sharing</h2>
      <p>
        Listing content and the contact details you choose to publish are visible to other users.
        We use infrastructure providers (hosting, database, email, analytics) solely to operate the
        service.
      </p>
      <h2 className="text-xl font-semibold text-white pt-4">Your choices</h2>
      <p>
        You may update or delete your listings and request account deletion by contacting us. You
        can stop using the service at any time.
      </p>
      <h2 className="text-xl font-semibold text-white pt-4">Contact</h2>
      <p>
        Privacy questions:{' '}
        <a href="mailto:admin@rv-chain.com" className="text-amber-300 font-semibold underline">
          admin@rv-chain.com
        </a>
      </p>
    </MarketingPage>
  );
}
