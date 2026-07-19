'use client';

import {
  Calendar,
  Caravan,
  Leaf,
  MapPin,
  Sparkles,
  Gift,
  ArrowRight,
} from 'lucide-react';

export type HomeDestination =
  | 'trips'
  | 'marketplace'
  | 'field'
  | 'kids'
  | 'discover'
  | 'rewards';

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
  const greet = displayName?.trim() || 'traveler';

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-700/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950/50 p-6 sm:p-10">
        <div className="absolute -right-8 -top-8 text-[140px] opacity-[0.07] pointer-events-none select-none">
          ⛺
        </div>
        <div className="relative z-[1] max-w-xl">
          <p className="text-emerald-400/90 text-xs font-bold uppercase tracking-[0.2em] mb-2">
            Family road life OS
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Welcome back, {greet}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Plan trips, trade gear, explore trails — home base for RV families and road people.
            Little Explorer for kids (no tracking). Big Explorer for adult geo-catch.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            {tripCount > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-slate-200">
                {tripCount} trip{tripCount === 1 ? '' : 's'}
              </span>
            )}
            {plantCount > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-sky-500/20 text-sky-100">
                {plantCount} plants logged
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-100">
              {rewardPoints.toLocaleString()} crew pts
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 px-1">
          What do you want to do?
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onGo('trips')}
            className="group text-left rounded-3xl border border-orange-700/40 bg-gradient-to-br from-orange-950/70 to-slate-900 p-5 sm:p-6 hover:border-orange-500/50 transition shadow-lg shadow-orange-950/20"
          >
            <Calendar className="w-8 h-8 text-orange-300 mb-3 group-hover:scale-110 transition" />
            <div className="text-lg font-bold text-white flex items-center gap-2">
              Plan a trip
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-sm text-slate-400 mt-1.5 leading-snug">
              Dates, stops, pack lists — upgrade to Weekender+ (demo)
            </p>
          </button>

          <button
            type="button"
            onClick={() => onGo('marketplace')}
            className="group text-left rounded-3xl border border-amber-700/40 bg-gradient-to-br from-amber-950/60 to-slate-900 p-5 sm:p-6 hover:border-amber-500/50 transition shadow-lg shadow-amber-950/20"
          >
            <Caravan className="w-8 h-8 text-amber-300 mb-3 group-hover:scale-110 transition" />
            <div className="text-lg font-bold text-white flex items-center gap-2">
              Market
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-sm text-slate-400 mt-1.5 leading-snug">
              Listing software · contact sellers · no escrow
            </p>
          </button>

          <button
            type="button"
            onClick={() => onGo('field')}
            className="group text-left rounded-3xl border border-sky-700/40 bg-gradient-to-br from-sky-950/70 to-slate-900 p-5 sm:p-6 hover:border-sky-500/50 transition shadow-lg shadow-sky-950/20"
          >
            <Leaf className="w-8 h-8 text-sky-300 mb-3 group-hover:scale-110 transition" />
            <div className="text-lg font-bold text-white flex items-center gap-2">
              Big Explorer
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-sm text-slate-400 mt-1.5 leading-snug">
              Geo-catch plants · passport stamps · stickers
            </p>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onGo('kids')}
          className="text-left rounded-2xl border border-emerald-800/40 bg-emerald-950/30 hover:border-emerald-600/50 p-4 transition"
        >
          <Sparkles className="w-5 h-5 text-emerald-300 mb-2" />
          <div className="text-sm font-bold text-white">Little Explorer</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Kids games · no tracking</p>
        </button>
        <button
          type="button"
          onClick={() => onGo('discover')}
          className="text-left rounded-2xl border border-slate-700 bg-slate-900/50 hover:border-slate-500 p-4 transition"
        >
          <MapPin className="w-5 h-5 text-green-300 mb-2" />
          <div className="text-sm font-bold text-white">Community spots</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Road picks · not a full inventory</p>
        </button>
        <button
          type="button"
          onClick={() => onGo('rewards')}
          className="text-left rounded-2xl border border-amber-800/40 bg-amber-950/20 hover:border-amber-600/50 p-4 transition col-span-2 sm:col-span-1"
        >
          <Gift className="w-5 h-5 text-amber-300 mb-2" />
          <div className="text-sm font-bold text-white">Road Crew</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Loyalty stamps & points</p>
        </button>
      </section>

      <p className="text-center text-[11px] text-slate-500 leading-relaxed max-w-md mx-auto pb-4">
        rvchain — home base for RV families. Demo mode: listings and memberships are simulated on
        this device unless cloud tables are set up.
      </p>
    </div>
  );
}
