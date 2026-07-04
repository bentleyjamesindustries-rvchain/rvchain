'use client';

import { Info } from 'lucide-react';
import { REWARDS_DISCLOSURE } from '@/lib/rewardsDisclosure';

export default function RewardsDisclosure() {
  return (
    <section
      className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6"
      aria-labelledby="rewards-disclosure-title"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-sky-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="rewards-disclosure-title" className="font-semibold text-slate-200 text-sm sm:text-base">
            {REWARDS_DISCLOSURE.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            {REWARDS_DISCLOSURE.summary}
          </p>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-400 leading-relaxed list-disc pl-4 sm:pl-5">
            {REWARDS_DISCLOSURE.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-4 leading-relaxed border-t border-slate-800 pt-3">
            {REWARDS_DISCLOSURE.footer}
          </p>
        </div>
      </div>
    </section>
  );
}