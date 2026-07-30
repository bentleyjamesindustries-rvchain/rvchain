'use client';

import Link from 'next/link';
import MarketingPage from '@/components/MarketingPage';
import { useI18n } from '@/lib/i18n/context';

export default function GuideShell({
  titleKey,
  introKey,
  children,
}: {
  titleKey: string;
  introKey: string;
  children?: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <MarketingPage title={t(titleKey)}>
      <p>{t(introKey)}</p>
      {children}
      <p className="pt-4">
        <Link href="/" className="text-amber-400 underline">
          {t('guides.backHome')}
        </Link>
      </p>
    </MarketingPage>
  );
}
