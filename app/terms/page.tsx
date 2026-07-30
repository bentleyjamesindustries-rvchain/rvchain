import type { Metadata } from 'next';
import TermsContent from '@/components/pages/TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Use — rvchain',
  description:
    'Terms for using rvchain, a no-escrow private-party gear and parts marketplace.',
};

export default function TermsPage() {
  return <TermsContent />;
}
