import type { Metadata } from 'next';
import GuideShell from '@/components/pages/GuideShell';

export const metadata: Metadata = {
  title: 'Kids on the road gear | rvchain',
  description: 'Family-friendly gear ideas for little explorers.',
};

export default function Page() {
  return <GuideShell titleKey="guides.kidsTitle" introKey="guides.kidsIntro" />;
}
