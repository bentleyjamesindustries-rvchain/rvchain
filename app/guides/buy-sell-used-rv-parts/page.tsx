import type { Metadata } from 'next';
import MarketingPage from '@/components/MarketingPage';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Safely Buy & Sell Used RV Parts | rvchain',
  description:
    'Practical safety tips for private-party used RV parts: photos, fitment, meetups, and what to avoid.',
};

export default function Page() {
  return (
    <MarketingPage title="How to Safely Buy & Sell Used RV Parts">
      <p>
        Used parts keep rigs on the road without dealership markups — if both sides stay careful.
        rvchain is a listing board only; the sale happens between you and the other party.
      </p>
      <h2 className="text-xl font-semibold text-white pt-2">For sellers</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Photograph the part from multiple angles; show wear honestly</li>
        <li>Write fitment notes: year, make/model if known, measurements</li>
        <li>State “fitment is buyer responsibility” when unsure</li>
        <li>Prefer local pickup for heavy items; use tracked shipping for small parts</li>
        <li>Never ship before payment clears in a method you trust</li>
      </ul>
      <h2 className="text-xl font-semibold text-white pt-2">For buyers</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Ask for close-ups of connectors, threads, and serial tags</li>
        <li>Confirm return policy before you pay (many private sales are final)</li>
        <li>Meet in public places for local pickup; bring a friend</li>
        <li>Compare against OEM diagrams or your old part before installing</li>
      </ul>
      <h2 className="text-xl font-semibold text-white pt-2">What rvchain does not do</h2>
      <p>
        We do not hold money, guarantee fitment, or inspect parts. That keeps fees low and keeps
        deals simple — and puts safety choices where they belong: with you.
      </p>
      <Link href="/" className="inline-flex text-amber-400 font-semibold text-sm pt-2">
        Browse parts on rvchain →
      </Link>
    </MarketingPage>
  );
}
