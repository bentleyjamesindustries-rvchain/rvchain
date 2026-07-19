'use client';

import { Info } from 'lucide-react';
import { MARKETPLACE_DISCLOSURE } from '@/lib/marketplaceDisclosure';

export default function MarketplaceDisclosure({ compact }: { compact?: boolean }) {
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
            {MARKETPLACE_DISCLOSURE.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{MARKETPLACE_DISCLOSURE.summary}</p>
          {!compact && (
            <ul className="mt-2 space-y-1.5 text-[11px] sm:text-xs text-slate-500 leading-relaxed list-disc pl-4">
              {MARKETPLACE_DISCLOSURE.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-slate-600 mt-3 border-t border-slate-800 pt-2">
            {MARKETPLACE_DISCLOSURE.footer}
          </p>
        </div>
      </div>
    </section>
  );
}
