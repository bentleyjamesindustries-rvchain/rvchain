'use client';

import {
  Calendar,
  Caravan,
  Leaf,
  Sparkles,
  Gift,
  ArrowRight,
  MessagesSquare,
  Bot,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export type HomeDestination =
  | 'trips'
  | 'marketplace'
  | 'field'
  | 'kids'
  | 'rewards'
  | 'community'
  | 'ai';

interface HomeHubProps {
  displayName?: string | null;
  onGo: (tab: HomeDestination) => void;
  tripCount?: number;
  plantCount?: number;
  rewardPoints?: number;
}

export default function HomeHub({
  displayName,
  onGo,
  tripCount = 0,
  plantCount = 0,
  rewardPoints = 0,
}: HomeHubProps) {
  const { t } = useI18n();
  const greet = displayName?.trim() || t('home.adventurer');

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-violet-600/40 bg-gradient-to-br from-violet-950 via-slate-900 to-amber-950/50 p-6 sm:p-10">
        <div className="absolute -right-8 -top-8 text-[140px] opacity-[0.07] pointer-events-none select-none">
          🏔
        </div>
        <div className="relative z-[1] max-w-xl">
          <p className="text-violet-300 text-xs font-bold uppercase tracking-[0.2em] mb-2">
            {t('home.eyebrow')}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            {t('home.welcome', { name: greet })}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-100 leading-relaxed">
            {t('home.blurb')}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            {tripCount > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-slate-200">
                {t(tripCount === 1 ? 'home.trips' : 'home.trips_other', { n: tripCount })}
              </span>
            )}
            {plantCount > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-sky-500/20 text-sky-100">
                {t('home.plants', { n: plantCount })}
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-100">
              {t('home.crewPts', { n: rewardPoints.toLocaleString() })}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onGo('ai')}
            className="mt-5 h-12 px-6 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm inline-flex items-center gap-2"
          >
            <Bot className="w-5 h-5" />
            {t('home.tryAi')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3 px-1">
          {t('home.whatDo')}
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onGo('ai')}
            className="group text-left rounded-3xl border border-violet-600/50 bg-gradient-to-br from-violet-950/80 to-slate-900 p-5 sm:p-6 hover:border-violet-400/60 transition shadow-lg"
          >
            <Bot className="w-8 h-8 text-violet-300 mb-3 group-hover:scale-110 transition" />
            <div className="text-lg font-bold text-white flex items-center gap-2">
              {t('home.aiTitle')}
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-sm text-slate-300 mt-1.5 leading-snug">{t('home.aiDesc')}</p>
          </button>

          <button
            type="button"
            onClick={() => onGo('marketplace')}
            className="group text-left rounded-3xl border border-amber-700/40 bg-gradient-to-br from-amber-950/70 to-slate-900 p-5 sm:p-6 hover:border-amber-500/50 transition shadow-lg"
          >
            <Caravan className="w-8 h-8 text-amber-300 mb-3 group-hover:scale-110 transition" />
            <div className="text-lg font-bold text-white flex items-center gap-2">
              {t('home.marketTitle')}
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-sm text-slate-300 mt-1.5 leading-snug">{t('home.marketDesc')}</p>
          </button>

          <button
            type="button"
            onClick={() => onGo('trips')}
            className="group text-left rounded-3xl border border-orange-700/40 bg-gradient-to-br from-orange-950/70 to-slate-900 p-5 sm:p-6 hover:border-orange-500/50 transition shadow-lg"
          >
            <Calendar className="w-8 h-8 text-orange-300 mb-3 group-hover:scale-110 transition" />
            <div className="text-lg font-bold text-white flex items-center gap-2">
              {t('home.tripTitle')}
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-sm text-slate-300 mt-1.5 leading-snug">{t('home.tripDesc')}</p>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onGo('kids')}
          className="text-left rounded-2xl border border-emerald-800/40 bg-emerald-950/30 hover:border-emerald-600/50 p-4 transition"
        >
          <Sparkles className="w-5 h-5 text-emerald-300 mb-2" />
          <div className="text-sm font-bold text-white">{t('home.kidsTitle')}</div>
          <p className="text-[11px] text-slate-300 mt-0.5">{t('home.kidsDesc')}</p>
        </button>
        <button
          type="button"
          onClick={() => onGo('field')}
          className="text-left rounded-2xl border border-sky-800/40 bg-sky-950/30 hover:border-sky-600/50 p-4 transition"
        >
          <Leaf className="w-5 h-5 text-sky-300 mb-2" />
          <div className="text-sm font-bold text-white">{t('home.trailTitle')}</div>
          <p className="text-[11px] text-slate-300 mt-0.5">{t('home.trailDesc')}</p>
        </button>
        <button
          type="button"
          onClick={() => onGo('community')}
          className="text-left rounded-2xl border border-slate-600 bg-slate-900/50 hover:border-slate-400 p-4 transition"
        >
          <MessagesSquare className="w-5 h-5 text-sky-300 mb-2" />
          <div className="text-sm font-bold text-white">{t('home.forumTitle')}</div>
          <p className="text-[11px] text-slate-300 mt-0.5">{t('home.forumDesc')}</p>
        </button>
        <button
          type="button"
          onClick={() => onGo('rewards')}
          className="text-left rounded-2xl border border-amber-800/40 bg-amber-950/20 hover:border-amber-600/50 p-4 transition"
        >
          <Gift className="w-5 h-5 text-amber-300 mb-2" />
          <div className="text-sm font-bold text-white">{t('home.crewTitle')}</div>
          <p className="text-[11px] text-slate-300 mt-0.5">{t('home.crewDesc')}</p>
        </button>
      </section>

      <p className="text-center text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto pb-4">
        {t('home.footerNote')}
      </p>
    </div>
  );
}
