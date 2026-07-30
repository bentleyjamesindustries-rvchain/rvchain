'use client';

import { Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function MarketplaceDisclosure({ compact }: { compact?: boolean }) {
  const { t } = useI18n();
  const bullets = [
    t('market.discB1'),
    t('market.discB2'),
    t('market.discB3'),
    t('market.discB4'),
    t('market.discB5'),
    t('market.discB6'),
    t('market.discB7'),
  ];
  return (
    <section
      className={`bg-slate-900/80 border border-slate-700/80 rounded-3xl ${compact ? 'p-4' : 'p-5 sm:p-6'}`}
      aria-labelledby="marketplace-disclosure-title"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center shrink-0">
          <Info className="w-4 h-4 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="marketplace-disclosure-title" className="font-semibold text-slate-200 text-sm">
            {t('market.discTitle')}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{t('market.discSummary')}</p>
          {!compact && (
            <ul className="mt-2 space-y-1.5 text-[11px] sm:text-xs text-slate-500 leading-relaxed list-disc pl-4">
              {bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-slate-600 mt-3 border-t border-slate-800 pt-2">
            {t('market.discFooter')}
          </p>
        </div>
      </div>
    </section>
  );
}
