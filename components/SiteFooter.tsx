'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';

export default function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 mt-auto bg-slate-950/80">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold text-white text-lg tracking-tight">rvchain</div>
            <p className="text-slate-300 mt-2 text-sm leading-relaxed max-w-xs">{t('footer.blurb')}</p>
            <p className="mt-3 text-sm">
              <a
                href="mailto:admin@rv-chain.com"
                className="text-amber-300 font-semibold hover:text-amber-200 underline"
              >
                admin@rv-chain.com
              </a>
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-3">
              {t('footer.company')}
            </div>
            <ul className="space-y-2 text-slate-100 font-medium">
              <li>
                <Link href="/about" className="hover:text-white">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-3">
              {t('footer.guides')}
            </div>
            <ul className="space-y-2 text-slate-100 font-medium">
              <li>
                <Link href="/guides/essential-gear-checklist" className="hover:text-white">
                  {t('footer.guideEssential')}
                </Link>
              </li>
              <li>
                <Link href="/guides/buy-sell-used-rv-parts" className="hover:text-white">
                  {t('footer.guideParts')}
                </Link>
              </li>
              <li>
                <Link href="/guides/sell-used-rv-gear-2026" className="hover:text-white">
                  {t('footer.guideSell')}
                </Link>
              </li>
              <li>
                <Link href="/guides/kids-on-the-road-gear" className="hover:text-white">
                  {t('footer.guideKids')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-8 text-center">
          {t('footer.copyright', { year })}
        </p>
      </div>
    </footer>
  );
}
