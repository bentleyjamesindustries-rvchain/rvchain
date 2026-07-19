'use client';

import { ArrowLeft, Flame, TreePine } from 'lucide-react';
import { getHighScore, type KidsGameId } from '@/lib/kidsGames';

export type KidsGameScreen = KidsGameId;

interface KidsGamesHubProps {
  userId: string;
  onBack: () => void;
  onPlay: (gameId: KidsGameId) => void;
}

const GAMES: Array<{
  id: KidsGameId;
  title: string;
  blurb: string;
  how: string;
  icon: typeof TreePine;
  accent: string;
}> = [
  {
    id: 'trail-run',
    title: 'Trail Run',
    blurb: 'Jump logs and grab leaves on the trail.',
    how: 'Tap or press Space to jump',
    icon: TreePine,
    accent: 'from-emerald-950/80 to-slate-900 border-emerald-700/40 hover:border-emerald-500/50',
  },
  {
    id: 'marshmallow-catch',
    title: 'Marshmallow Catch',
    blurb: 'Catch toasty mallows. Skip the charcoal!',
    how: 'Drag or use arrow keys',
    icon: Flame,
    accent: 'from-orange-950/70 to-slate-900 border-orange-700/40 hover:border-orange-500/50',
  },
];

export default function KidsGamesHub({ userId, onBack, onPlay }: KidsGamesHubProps) {
  return (
    <div className="space-y-4 max-w-screen-xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Explorers
      </button>

      <div className="rounded-3xl border border-sky-800/40 bg-gradient-to-br from-sky-950/50 via-slate-900 to-violet-950/30 p-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Games</h2>
        <p className="mt-1 text-sm text-slate-300 leading-relaxed max-w-md">
          Short trail games you can play right here — no download. Best scores save on this device.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {GAMES.map((game) => {
          const best = getHighScore(userId, game.id);
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onPlay(game.id)}
              className={`text-left rounded-3xl border bg-gradient-to-br p-5 sm:p-6 transition ${game.accent}`}
            >
              <Icon className="w-8 h-8 text-white/90 mb-3" />
              <div className="text-lg font-bold text-white">{game.title}</div>
              <p className="text-sm text-slate-300 mt-1 leading-snug">{game.blurb}</p>
              <p className="text-xs text-slate-400 mt-2">{game.how}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-amber-200/90">
                  Best: {best > 0 ? best : '—'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-white/80 bg-white/10 px-3 py-1.5 rounded-xl">
                  Play →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
