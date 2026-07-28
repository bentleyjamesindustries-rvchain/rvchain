import type { Metadata } from 'next';
import MarketingPage from '@/components/MarketingPage';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Best Places to Sell Used RV Gear in 2026 | rvchain',
  description:
    'Where road families sell used camping gear in 2026 — local pickup, specialty boards like rvchain, and what works for each.',
};

export default function Page() {
  return (
    <MarketingPage title="Best Places to Sell Used RV Gear in 2026">
      <p>
        Garage corners fill up fast on the road. Here is a practical map of where to sell used RV
        and camping gear in 2026 — without turning it into a second job.
      </p>
      <h2 className="text-xl font-semibold text-white pt-2">1. Specialty road-life boards (like rvchain)</h2>
      <p>
        Buyers already think in coolers, solar, and hitch hardware. Listings reach people who
        understand the gear. On rvchain you post photos, set a price, and buyers contact you
        directly — no escrow cut, no vehicle dealer theater.
      </p>
      <h2 className="text-xl font-semibold text-white pt-2">2. Local pickup marketplaces</h2>
      <p>
        Great for bulky items (tents, chairs, generators). Meet in daylight at a public place.
        Price slightly lower than shipping-heavy options so local buyers bite quickly.
      </p>
      <h2 className="text-xl font-semibold text-white pt-2">3. Club boards &amp; campground boards</h2>
      <p>
        Small audiences, high intent. Check club rules before posting. Keep copy clear and friendly.
      </p>
      <h2 className="text-xl font-semibold text-white pt-2">Tips that work in 2026</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Clean the item; first photo should look ready to use</li>
        <li>Include dimensions and “why you’re selling” in one line</li>
        <li>Respond the same day — serious buyers move on fast</li>
        <li>Bundle small items (hose + filter) to clear inventory</li>
      </ul>
      <Link href="/" className="inline-flex text-amber-400 font-semibold text-sm pt-2">
        List on rvchain Market →
      </Link>
    </MarketingPage>
  );
}
