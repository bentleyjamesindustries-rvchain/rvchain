'use client';

import Link from 'next/link';
import MarketingPage from '@/components/MarketingPage';
import { useI18n } from '@/lib/i18n/context';

export default function AboutContent() {
  const { t } = useI18n();
  return (
    <MarketingPage title={t('about.title')}>
      <p className="text-lg text-white font-medium">{t('about.p1')}</p>
      <p>{t('about.p2')}</p>
      <p>{t('about.p3')}</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t('about.li1')}</li>
        <li>{t('about.li2')}</li>
        <li>{t('about.li3')}</li>
      </ul>
      <p>
        {t('about.taglineLabel')}{' '}
        <span className="text-violet-300 font-semibold">{t('brand.tagline')}</span>
      </p>
      <div className="flex flex-wrap gap-3 pt-4">
        <Link
          href="/"
          className="inline-flex h-11 items-center px-5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm"
        >
          {t('about.openAi')}
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm"
        >
          {t('about.openMarket')}
        </Link>
      </div>
    </MarketingPage>
  );
}
