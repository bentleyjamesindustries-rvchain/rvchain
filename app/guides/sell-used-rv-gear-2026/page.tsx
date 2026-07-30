import type { Metadata } from 'next';
import GuideShell from '@/components/pages/GuideShell';

export const metadata: Metadata = {
  title: 'Where to sell used gear | rvchain',
  description: 'Options for selling used RV and powersports gear.',
};

export default function Page() {
  return <GuideShell titleKey="guides.sellTitle" introKey="guides.sellIntro" />;
}
