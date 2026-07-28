import type { Metadata } from 'next';
import MarketingPage from '@/components/MarketingPage';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Essential Gear Checklist for Family RVers | rvchain',
  description:
    'A practical packing and gear checklist for families living or traveling in an RV — coolers, power, safety, and kid-friendly gear.',
  openGraph: {
    title: 'Essential Gear Checklist for Family RVers',
    description: 'What road families actually use — and where to buy/sell used gear.',
  },
};

export default function Page() {
  return (
    <MarketingPage title="Essential Gear Checklist for Family RVers">
      <p>
        Whether you are full-timing or weekend warriors, the right gear keeps chaos down and
        memories up. Use this checklist to stock the rig — then list what you outgrow on{' '}
        <Link href="/" className="text-amber-400 underline">
          rvchain Market
        </Link>
        .
      </p>
      <h2 className="text-xl font-semibold text-white pt-2">Kitchen &amp; food</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Hard-sided cooler or fridge setup that fits your power plan</li>
        <li>Drinking-water hose and simple filter</li>
        <li>Collapsible dish bin, basic cookware, reusable plates</li>
        <li>Trash bags and odor control for small spaces</li>
      </ul>
      <h2 className="text-xl font-semibold text-white pt-2">Power &amp; light</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>LED lanterns and headlamps (one per person)</li>
        <li>Extension cords rated for outdoor use</li>
        <li>Portable power bank for phones and tablets</li>
        <li>Optional: small solar panel for topping house batteries</li>
      </ul>
      <h2 className="text-xl font-semibold text-white pt-2">Safety &amp; setup</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>First-aid kit sized for your family</li>
        <li>Fire extinguisher and smoke/CO detectors (check batteries)</li>
        <li>Leveling blocks, wheel chocks, and basic tool kit</li>
        <li>Reflective vests for roadside stops with kids</li>
      </ul>
      <h2 className="text-xl font-semibold text-white pt-2">Family comfort</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Camp chairs that fold flat</li>
        <li>Weather-appropriate layers and rain covers</li>
        <li>Quiet-time gear: books, cards, small games (no screens required)</li>
        <li>Bin system for toys so the floor stays walkable</li>
      </ul>
      <p className="pt-2">
        Outgrown a cooler or tent? List it on rvchain — private-party, contact the buyer yourself, no
        vehicle dealer nonsense.
      </p>
      <Link href="/" className="inline-flex text-amber-400 font-semibold text-sm pt-2">
        List gear on rvchain →
      </Link>
    </MarketingPage>
  );
}
