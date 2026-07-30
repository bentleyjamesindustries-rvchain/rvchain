'use client';

import MarketingPage from '@/components/MarketingPage';
import { useI18n } from '@/lib/i18n/context';

export default function PrivacyContent() {
  const { t } = useI18n();
  return (
    <MarketingPage title={t('privacy.title')}>
      <p className="text-xs text-slate-500">{t('privacy.updated')}</p>
      <p>{t('privacy.intro')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('privacy.s1')}</h2>
      <p>{t('privacy.s1b')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('privacy.s2')}</h2>
      <p>{t('privacy.s2b')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('privacy.s3')}</h2>
      <p>{t('privacy.s3b')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('privacy.s4')}</h2>
      <p>{t('privacy.s4b')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('privacy.s5')}</h2>
      <p>{t('privacy.s5b')}</p>
      <h2 className="text-xl font-semibold text-white pt-4">{t('privacy.s6')}</h2>
      <p>{t('privacy.s6b')}</p>
    </MarketingPage>
  );
}
