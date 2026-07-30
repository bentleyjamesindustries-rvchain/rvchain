import type { Metadata } from 'next';
import PrivacyContent from '@/components/pages/PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy — rvchain',
  description: 'How rvchain handles your data for our private-party gear and parts marketplace.',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
