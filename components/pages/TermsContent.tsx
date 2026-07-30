'use client';

import MarketingPage from '@/components/MarketingPage';
import { useI18n } from '@/lib/i18n/context';

export default function TermsContent() {
  const { t } = useI18n();
  return (
    <MarketingPage title={t('terms.title')}>
      <p className="text-xs text-slate-500">{t('terms.updated')}</p>
      <p>{t('terms.intro')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('terms.s1')}</h2>
      <p>{t('terms.s1b')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('terms.s2')}</h2>
      <p>{t('terms.s2b')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('terms.s3')}</h2>
      <p>{t('terms.s3b')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('terms.s4')}</h2>
      <p>{t('terms.s4b')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('terms.s5')}</h2>
      <p>{t('terms.s5b')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('terms.s6')}</h2>
      <p>{t('terms.s6b')}</p>
    </MarketingPage>
  );
}
