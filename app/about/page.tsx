import type { Metadata } from 'next';
import AboutContent from '@/components/pages/AboutContent';

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
  return <AboutContent />;
}
