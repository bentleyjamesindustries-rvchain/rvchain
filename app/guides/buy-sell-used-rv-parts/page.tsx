import type { Metadata } from 'next';
import GuideShell from '@/components/pages/GuideShell';

export const metadata: Metadata = {
  title: 'Buy & sell used parts safely | rvchain',
  description: 'Tips for private-party gear and parts on RV Chain Market.',
};

export default function Page() {
  return <GuideShell titleKey="guides.partsTitle" introKey="guides.partsIntro" />;
}
