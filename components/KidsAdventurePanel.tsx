'use client';

import { useState } from 'react';
import { BookOpen, Gamepad2, Leaf, Sparkles } from 'lucide-react';
import KidsScavengerHunt from './KidsScavengerHunt';
import KidsCardAlbum from './KidsCardAlbum';
import KidsGamesHub from './kids-games/KidsGamesHub';
import TrailRunGame from './kids-games/TrailRunGame';
import MarshmallowCatchGame from './kids-games/MarshmallowCatchGame';
import TreeClimbGame from './kids-games/TreeClimbGame';
import { loadKidsProgress } from '@/lib/kidsProgress';
import { TRAIL_BADGES } from '@/lib/trailBadges';
import type { KidsGameId } from '@/lib/kidsGames';

type KidsView = 'hub' | 'hunt' | 'cards' | 'howto' | 'games' | KidsGameId;

interface KidsAdventurePanelProps {
  userId: string;
  stateCode?: string | null;
  displayHandle?: string;
  isExplorer?: boolean;
  onRequestExplorerSignIn?: () => void;
  onRequestParentExplorers?: () => void;
}

export default function KidsAdventurePanel({
  userId,
  stateCode,
  displayHandle,
  isExplorer,
  onRequestExplorerSignIn,
  onRequestParentExplorers,
}: KidsAdventurePanelProps) {
  const [view, setView] = useState<KidsView>('hub');
  const [tick, setTick] = useState(0);
  void tick;

  const progress = loadKidsProgress(userId);
  const plantsFound = Object.keys(progress.finds).length;
  const badges = progress.ownedBadgeIds.length;
  const name = displayHandle?.trim() || 'Explorer';
  const refresh = () => setTick((n) => n + 1);

  if (view === 'hunt') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <KidsScavengerHunt
          userId={userId}
          stateCode={stateCode}
          onBack={() => {
            refresh();
            setView('hub');
          }}
          onProgressChange={refresh}
        />
      </div>
    );
  }

  if (view === 'cards') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <KidsCardAlbum
          userId={userId}
          onBack={() => {
            refresh();
            setView('hub');
          }}
          onProgressChange={refresh}
        />
      </div>
    );
  }

  if (view === 'games') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <KidsGamesHub
          userId={userId}
          onBack={() => setView('hub')}
          onPlay={(gameId) => setView(gameId)}
        />
      </div>
    );
  }

  if (view === 'trail-run') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <TrailRunGame userId={userId} onBack={() => setView('games')} />
      </div>
    );
  }

  if (view === 'marshmallow-catch') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <MarshmallowCatchGame userId={userId} onBack={() => setView('games')} />
      </div>
    );
  }

  if (view === 'tree-climb') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <TreeClimbGame userId={userId} onBack={() => setView('games')} />
      </div>
    );
  }

  if (view === 'howto') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        <button
          type="button"
          onClick={() => setView('hub')}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back
        </button>
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">How it works</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300 leading-relaxed">
            <li>
              <strong className="text-white">Hunt</strong> — find plants outside (with a grown-up)
              and take a photo (optional GPS tags your catch).
            </li>
            <li>
              <strong className="text-white">Collect</strong> — each plant unlocks a sticker. Free
              packs give fun camping badges.
            </li>
            <li>
              <strong className="text-white">Games</strong> — Trail Run, Tree Climb, and
              Marshmallow Catch. High scores save on this device.
            </li>
          </ol>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-slate-300">For parents</p>
            <p>Supervise outdoors. Don’t pick protected plants. Photos are just for fun.</p>
            <p>No real-money purchases for explorers. Progress and scores save on this device.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="rounded-3xl border border-emerald-800/40 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Explorers{name !== 'Explorer' ? ` · ${name}` : ''}
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-md leading-relaxed">
          Find plants outside · collect badges · play trail games.
        </p>
        <p className="mt-3 text-sm font-semibold text-emerald-200/90">
          {plantsFound} plant{plantsFound === 1 ? '' : 's'} found · {badges}/{TRAIL_BADGES.length}{' '}
          badges
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setView('hunt')}
          className="text-left rounded-3xl border border-emerald-700/40 bg-emerald-950/40 hover:border-emerald-500/50 p-5 sm:p-6 transition"
        >
          <Leaf className="w-8 h-8 text-emerald-400 mb-3" />
          <div className="text-lg font-bold text-white">Find plants</div>
          <p className="text-sm text-slate-400 mt-1">Scavenger hunt with your camera</p>
        </button>

        <button
          type="button"
          onClick={() => setView('cards')}
          className="text-left rounded-3xl border border-violet-700/40 bg-violet-950/30 hover:border-violet-500/50 p-5 sm:p-6 transition"
        >
          <Sparkles className="w-8 h-8 text-violet-300 mb-3" />
          <div className="text-lg font-bold text-white">My collection</div>
          <p className="text-sm text-slate-400 mt-1">Stickers, badges, and free packs</p>
        </button>

        <button
          type="button"
          onClick={() => setView('games')}
          className="text-left rounded-3xl border border-sky-700/40 bg-sky-950/40 hover:border-sky-500/50 p-5 sm:p-6 transition sm:col-span-1 col-span-1"
        >
          <Gamepad2 className="w-8 h-8 text-sky-300 mb-3" />
          <div className="text-lg font-bold text-white">Games</div>
          <p className="text-sm text-slate-400 mt-1">Trail Run, Marshmallow Catch, and more</p>
        </button>
      </div>

      {!isExplorer && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Want your own explorer save? Use a family code (Profile → My Explorers).
          </p>
          <div className="flex flex-wrap gap-2 shrink-0">
            {onRequestExplorerSignIn && (
              <button
                type="button"
                onClick={onRequestExplorerSignIn}
                className="px-3 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold"
              >
                Explorer sign-in
              </button>
            )}
            {onRequestParentExplorers && (
              <button
                type="button"
                onClick={onRequestParentExplorers}
                className="px-3 h-9 rounded-xl border border-slate-600 hover:bg-slate-800 text-xs font-semibold"
              >
                Parent setup
              </button>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setView('howto')}
        className="w-full text-left rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 flex items-center gap-3 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition"
      >
        <BookOpen className="w-4 h-4 shrink-0" />
        How it works & parent tips
      </button>
    </div>
  );
}
