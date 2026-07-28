import type { Metadata } from 'next';
import MarketingPage from '@/components/MarketingPage';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kids on the Road: Gear That Actually Helps | rvchain',
  description:
    'Kid-friendly road gear that earns its space in an RV — without filling every cubby with plastic noise.',
};

export default function Page() {
  return (
    <MarketingPage title="Kids on the Road: Gear That Actually Helps">
      <p>
        Space is limited. Noise is optional. Here is gear that tends to earn its keep for families
        on the road — and what you can skip.
      </p>
      <h2 className="text-xl font-semibold text-white pt-2">Worth packing</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Compact binoculars for wildlife and rest-stop “missions”</li>
        <li>Washable picnic blanket for park days</li>
        <li>LED lanterns kids can run themselves (with supervision rules)</li>
        <li>Card games and a small magnetic board for rainy days</li>
        <li>Durable water bottles with names written on them</li>
      </ul>
      <h2 className="text-xl font-semibold text-white pt-2">Usually overrated</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Giant outdoor toys that only fit one campsite layout</li>
        <li>Duplicate “just in case” gadgets that never leave the bin</li>
        <li>Flimsy chairs that break mid-season</li>
      </ul>
      <h2 className="text-xl font-semibold text-white pt-2">Sell what they outgrow</h2>
      <p>
        Kids size out of gear fast. List quality used items on{' '}
        <Link href="/" className="text-amber-400 underline">
          rvchain
        </Link>{' '}
        so another family can use them — private-party, simple contact, no dealership middleman.
      </p>
      <p className="text-sm text-slate-400">
        rvchain also has free kids activities in Little Explorer (games-style, no GPS tracking) when
        you need a break from the drive.
      </p>
    </MarketingPage>
  );
}
