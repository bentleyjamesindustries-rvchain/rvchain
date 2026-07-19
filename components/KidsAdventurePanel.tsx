'use client';

import { useState } from 'react';
import { BookOpen, Gamepad2, Leaf, Shield } from 'lucide-react';
import KidsFieldGuide from './KidsFieldGuide';
import KidsGamesHub from './kids-games/KidsGamesHub';
import TrailRunGame from './kids-games/TrailRunGame';
import MarshmallowCatchGame from './kids-games/MarshmallowCatchGame';
import TreeClimbGame from './kids-games/TreeClimbGame';
import type { KidsGameId } from '@/lib/kidsGames';

type KidsView = 'hub' | 'guide' | 'howto' | 'games' | KidsGameId;

/**
 * Little Explorer — play games + learn plants.
 * No GPS, no camera capture, no accounts, no saved plant finds or photos.
 * Game high scores use a shared anonymous device key only.
 */
const KIDS_PLAY_ID = 'kids-zone-play';

interface KidsAdventurePanelProps {
  /** @deprecated ignored — kids zone does not use personal user ids for collection */
  userId?: string;
  stateCode?: string | null;
  displayHandle?: string;
  isExplorer?: boolean;
  onRequestExplorerSignIn?: () => void;
  onRequestParentExplorers?: () => void;
}

export default function KidsAdventurePanel({ stateCode }: KidsAdventurePanelProps) {
  const [view, setView] = useState<KidsView>('hub');

  if (view === 'guide') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <KidsFieldGuide stateCode={stateCode} onBack={() => setView('hub')} />
      </div>
    );
  }

  if (view === 'games') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <KidsGamesHub
          userId={KIDS_PLAY_ID}
          onBack={() => setView('hub')}
          onPlay={(gameId) => setView(gameId)}
        />
      </div>
    );
  }

  if (view === 'trail-run') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <TrailRunGame userId={KIDS_PLAY_ID} onBack={() => setView('games')} />
      </div>
    );
  }

  if (view === 'marshmallow-catch') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <MarshmallowCatchGame userId={KIDS_PLAY_ID} onBack={() => setView('games')} />
      </div>
    );
  }

  if (view === 'tree-climb') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <TreeClimbGame userId={KIDS_PLAY_ID} onBack={() => setView('games')} />
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
          <h2 className="text-xl font-bold text-white">Little Explorer — privacy first</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300 leading-relaxed">
            <li>
              <strong className="text-white">No GPS</strong> — we never request location here.
            </li>
            <li>
              <strong className="text-white">No camera logging</strong> — no field photos are saved.
            </li>
            <li>
              <strong className="text-white">No accounts</strong> — play without signing in as a
              child.
            </li>
            <li>
              <strong className="text-white">Field guide</strong> — learn plant facts with a grown-up
              outdoors (look only).
            </li>
            <li>
              <strong className="text-white">Games</strong> — fun trail mini-games. Optional high
              scores use an anonymous device key, not a child profile.
            </li>
          </ul>
          <div className="rounded-2xl border border-sky-800/40 bg-sky-950/30 p-4 text-xs text-sky-100/90 leading-relaxed">
            <p className="font-semibold text-sky-200 mb-1">Want geo-catch & stickers?</p>
            <p>
              Grown-ups use the <strong>Big Explorer</strong> tab (18+) for location and photo
              logging. Keep kids in Little Explorer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="rounded-3xl border border-emerald-800/40 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Little Explorer</h1>
        <p className="mt-2 text-sm text-slate-300 max-w-lg leading-relaxed">
          Play trail games and learn about plants — with a grown-up. This zone does not collect
          GPS, photos, or personal information.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-sky-800/40 bg-sky-950/25 px-4 py-3 text-xs sm:text-sm text-sky-100/90">
        <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-sky-200">Privacy:</strong> no location, no camera saves, no child
          accounts here. Adults geo-catch in <strong>Big Explorer</strong>.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setView('guide')}
          className="text-left rounded-3xl border border-emerald-700/40 bg-emerald-950/40 hover:border-emerald-500/50 p-5 sm:p-6 transition"
        >
          <Leaf className="w-8 h-8 text-emerald-400 mb-3" />
          <div className="text-lg font-bold text-white">Field guide</div>
          <p className="text-sm text-slate-400 mt-1">Learn plants — look only, nothing is saved</p>
        </button>

        <button
          type="button"
          onClick={() => setView('games')}
          className="text-left rounded-3xl border border-sky-700/40 bg-sky-950/40 hover:border-sky-500/50 p-5 sm:p-6 transition"
        >
          <Gamepad2 className="w-8 h-8 text-sky-300 mb-3" />
          <div className="text-lg font-bold text-white">Games</div>
          <p className="text-sm text-slate-400 mt-1">Trail Run, Tree Climb, Marshmallow Catch</p>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setView('howto')}
        className="w-full text-left rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 flex items-center gap-3 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition"
      >
        <BookOpen className="w-4 h-4 shrink-0" />
        How Little Explorer works & privacy
      </button>
    </div>
  );
}
