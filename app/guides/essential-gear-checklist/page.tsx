import type { Metadata } from 'next';
import GuideShell from '@/components/pages/GuideShell';

export const metadata: Metadata = {
  title: 'Essential Gear Checklist for Family RVers | rvchain',
  description:
    'A practical packing and gear checklist for families living or traveling in an RV — coolers, power, safety, and kid-friendly gear.',
};

export default function Page() {
  return (
    <GuideShell titleKey="guides.essentialTitle" introKey="guides.essentialIntro" />
  );
}
