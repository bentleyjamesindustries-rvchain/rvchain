import type { Metadata } from 'next';
import MarketingPage from '@/components/MarketingPage';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About rvchain — Family Road Life Gear & Parts',
  description:
    'rvchain is a private-party gear and parts board for road families. Not a campground directory. Not a vehicle dealer.',
  openGraph: {
    title: 'About rvchain',
    description: 'Private-party gear & parts for family road life.',
    url: 'https://rv-chain.com/about',
  },
};

export default function AboutPage() {
  return (
    <MarketingPage title="About rvchain">
      <p className="text-lg text-slate-200">
        rvchain is a private-party gear &amp; parts board built for road families.
      </p>
      <ul className="list-disc pl-5 space-y-2 text-slate-300">
        <li>We are not a campground directory.</li>
        <li>We are not a vehicle dealer.</li>
        <li>We are not a big marketplace with escrow and fees taking a cut of every sale.</li>
      </ul>
      <p>
        You list your gear and parts. Interested buyers contact you directly. Simple.
      </p>
      <p>
        We’re building tools that make family life on the road easier — trip planning, kids
        activities, loyalty stamps, and a clean place to buy and sell the stuff that actually
        matters when you’re living out of an RV.
      </p>
      <p className="pt-4">
        <Link
          href="/"
          className="inline-flex h-11 items-center px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm"
        >
          Browse the market →
        </Link>
      </p>
    </MarketingPage>
  );
}
