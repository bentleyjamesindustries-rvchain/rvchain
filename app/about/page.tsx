import type { Metadata } from 'next';
import MarketingPage from '@/components/MarketingPage';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About RV Chain — Recreational Vehicles + Trailhead AI',
  description:
    'RV Chain is the co-pilot for recreational vehicle life: road campers, off-road trucks, ATVs, dirt bikes, snowmobiles, gear market, and Trailhead AI.',
  openGraph: {
    title: 'About RV Chain',
    description: 'Road. Trail. Ready. — AI + gear for recreational vehicles.',
    url: 'https://rv-chain.com/about',
  },
};

export default function AboutPage() {
  return (
    <MarketingPage title="About RV Chain">
      <p className="text-lg text-white font-medium">
        RV Chain is built for <strong className="text-amber-300">recreational vehicle life</strong>{' '}
        — not just Class A motorhomes. That means campers and towables, off-road trucks, ATVs and
        UTVs, dirt bikes, snowmobiles, and the gear that keeps you moving.
      </p>
      <p>
        <strong className="text-white">Trailhead AI</strong> is your co-pilot: part ID from photos,
        trip and trail planning, pre-ride checklists, and listing help for private-party gear sales.
      </p>
      <p>
        <strong className="text-white">Market</strong> is a simple gear &amp; parts board. You list.
        Buyers contact you. No escrow cut. No whole-vehicle dealership.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>We are not a campground directory.</li>
        <li>We are not a vehicle dealer.</li>
        <li>We are not a middleman holding your money.</li>
      </ul>
      <p>
        Tagline: <span className="text-violet-300 font-semibold">Road. Trail. Ready.</span>
      </p>
      <div className="flex flex-wrap gap-3 pt-4">
        <Link
          href="/"
          className="inline-flex h-11 items-center px-5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm"
        >
          Open Trailhead AI →
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm"
        >
          Browse Market →
        </Link>
      </div>
    </MarketingPage>
  );
}
