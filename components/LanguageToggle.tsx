'use client';

import { useI18n } from '@/lib/i18n/context';
import type { Locale } from '@/lib/i18n/types';

export default function LanguageToggle({
  className = '',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale, t } = useI18n();

  const btn = (code: Locale, label: string) => {
    const active = locale === code;
    return (
      <button
        type="button"
        onClick={() => setLocale(code)}
        className={`min-w-[2.25rem] px-2 py-1 rounded-lg text-xs font-bold transition ${
          active
            ? 'bg-amber-500 text-slate-950 shadow-sm'
            : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
        aria-pressed={active}
        aria-label={label}
        title={label}
      >
        {t(code === 'en' ? 'lang.en' : 'lang.es')}
      </button>
    );
  };

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-xl border border-white/15 bg-black/25 p-0.5 ${className}`}
      role="group"
      aria-label={t('lang.switchTo')}
    >
      {!compact && (
        <span className="hidden sm:inline pl-1.5 pr-0.5 text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
          {t('lang.switchTo')}
        </span>
      )}
      {btn('en', t('lang.english'))}
      {btn('es', t('lang.spanish'))}
    </div>
  );
}
