'use client';

import { ChevronLeft, MapPinned } from 'lucide-react';
import type { KidsProgress } from '@/lib/kidsProgress';
import { getPassportStamps, passportSummary } from '@/lib/explorerPassport';

interface BigExplorerPassportProps {
  progress: KidsProgress;
  onBack: () => void;
  onGoCatch: () => void;
}

export default function BigExplorerPassport({
  progress,
  onBack,
  onGoCatch,
}: BigExplorerPassportProps) {
  const stamps = getPassportStamps(progress);
  const summary = passportSummary(progress);

  return (
    <div className="space-y-4 max-w-screen-xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white min-h-[44px]"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="rounded-3xl border border-amber-700/40 bg-gradient-to-br from-amber-950/50 via-slate-900 to-sky-950/40 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <MapPinned className="w-6 h-6 text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Road passport
            </h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Stamp states when you geo-catch plants with GPS. Fill the map as you travel.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-600/40 text-amber-100">
                {summary.stamped} / {summary.total} states
              </span>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-600/40 text-sky-100">
                {summary.findsWithGps} GPS catches
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-600/40 text-emerald-100">
                {summary.pct}% complete
              </span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800 max-w-md">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-sky-400 transition-all"
                style={{ width: `${summary.pct}%` }}
              />
            </div>
          </div>
        </div>
        {summary.stamped === 0 && (
          <button
            type="button"
            onClick={onGoCatch}
            className="mt-4 w-full sm:w-auto min-h-[44px] px-5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold"
          >
            Geo-catch to earn your first stamp →
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-2">
        {stamps.map((s) => (
          <div
            key={s.code}
            title={
              s.stamped
                ? `${s.name}: ${s.findCount} catch${s.findCount === 1 ? '' : 'es'}`
                : `${s.name}: not stamped yet`
            }
            className={`rounded-xl border px-1 py-2.5 text-center transition ${
              s.stamped
                ? 'border-amber-500/60 bg-gradient-to-b from-amber-600/30 to-amber-950/40 shadow-md shadow-amber-900/20'
                : 'border-slate-800 bg-slate-950/60 opacity-50'
            }`}
          >
            <div
              className={`text-sm font-black tracking-wide ${
                s.stamped ? 'text-amber-100' : 'text-slate-500'
              }`}
            >
              {s.code}
            </div>
            {s.stamped && (
              <div className="text-[9px] text-amber-200/80 font-semibold mt-0.5">
                ×{s.findCount}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-500 text-center leading-relaxed max-w-md mx-auto">
        Stamps require a geo-catch with location on (state from GPS). Photo-only catches without GPS
        do not stamp the passport.
      </p>
    </div>
  );
}
