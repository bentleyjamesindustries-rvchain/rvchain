'use client';

import { useState } from 'react';
import { BookOpen, Compass, Leaf, Sparkles } from 'lucide-react';
import KidsScavengerHunt from './KidsScavengerHunt';
import KidsCardAlbum from './KidsCardAlbum';
import { loadKidsProgress } from '@/lib/kidsProgress';
import { KIDS_CARDS } from '@/lib/kidsCards';

type KidsView = 'hub' | 'hunt' | 'cards' | 'howto';

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
  const [progressTick, setProgressTick] = useState(0);

  void progressTick;
  const progress = loadKidsProgress(userId);
  const foundCount = Object.keys(progress.finds).length;
  const cardCount = progress.ownedCardIds.length;

  if (view === 'hunt') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 kids-adventure">
        <KidsScavengerHunt
          userId={userId}
          stateCode={stateCode}
          onBack={() => setView('hub')}
          onProgressChange={() => setProgressTick((n) => n + 1)}
        />
      </div>
    );
  }

  if (view === 'cards') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 kids-adventure">
        <KidsCardAlbum
          userId={userId}
          onBack={() => setView('hub')}
          onProgressChange={() => setProgressTick((n) => n + 1)}
        />
      </div>
    );
  }

  if (view === 'howto') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 kids-adventure space-y-4">
        <button
          type="button"
          onClick={() => setView('hub')}
          className="text-sm text-amber-200/90 hover:text-amber-100"
        >
          ← Back to base camp
        </button>
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 space-y-4">
          <h2 className="text-xl font-bold text-amber-50 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            How to play
          </h2>
          <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-300 leading-relaxed">
            <li>
              <strong className="text-slate-100">Plant scavenger hunt</strong> — go outside with a
              grown-up and look for plants on your trail list. Snap a photo to mark a find.
            </li>
            <li>
              <strong className="text-slate-100">Earn Trail Cards</strong> — every plant you find
              unlocks a matching collectible card in your album.
            </li>
            <li>
              <strong className="text-slate-100">Open trail packs</strong> — after your first find,
              open free demo packs for bonus creature cards.
            </li>
            <li>
              <strong className="text-slate-100">Show your profile</strong> — your best cards appear
              on your rvchain profile.
            </li>
          </ol>
          <div className="rounded-2xl border border-sky-800/50 bg-sky-950/30 p-4 text-sm text-sky-100/90 space-y-2">
            <p className="font-semibold text-sky-200">Parent tips</p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-sky-100/80 leading-relaxed">
              <li>Supervise kids outdoors and near water or roads.</li>
              <li>Do not pick protected plants or touch unknown mushrooms.</li>
              <li>Photos are for fun — not scientific plant identification.</li>
              <li>Progress is saved on this device (demo mode).</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 kids-adventure space-y-5">
      {/* Hero base camp */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-600/30 bg-gradient-to-br from-amber-950/70 via-emerald-950/50 to-slate-950 p-6 sm:p-8">
        <div className="absolute -right-8 -top-8 text-[120px] opacity-10 pointer-events-none select-none">
          ⛺
        </div>
        <div className="relative z-[1]">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            <Compass className="w-3.5 h-3.5" />
            Kids adventure trail
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-amber-50">
            Base camp{displayHandle ? `, ${displayHandle}` : ''}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-amber-100/80 max-w-xl leading-relaxed">
            Grab your field guide and start an outdoor quest. Hunt for plants, collect legendary
            Trail Cards, and build your explorer profile.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/50 text-emerald-200">
              🌿 {foundCount} plants found
            </span>
            <span className="px-3 py-1.5 rounded-full bg-sky-900/50 border border-sky-700/50 text-sky-200">
              🃏 {cardCount} / {KIDS_CARDS.length} cards
            </span>
            {isExplorer && (
              <span className="px-3 py-1.5 rounded-full bg-amber-900/50 border border-amber-700/50 text-amber-200">
                Explorer signed in
              </span>
            )}
          </div>
        </div>
      </div>

      {!isExplorer && (
        <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs sm:text-sm leading-relaxed">
            For their own plants &amp; cards, kids sign in with a family code. Parents set this up under
            Profile → My Little Explorers.
          </p>
          <div className="flex flex-wrap gap-2 shrink-0">
            {onRequestExplorerSignIn && (
              <button
                type="button"
                onClick={onRequestExplorerSignIn}
                className="px-3 h-9 rounded-xl bg-amber-700 hover:bg-amber-600 text-xs font-semibold"
              >
                Explorer sign-in
              </button>
            )}
            {onRequestParentExplorers && (
              <button
                type="button"
                onClick={onRequestParentExplorers}
                className="px-3 h-9 rounded-xl border border-amber-700/50 hover:bg-amber-900/40 text-xs font-semibold"
              >
                Parent setup
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mission tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setView('hunt')}
          className="group text-left rounded-3xl border border-emerald-700/40 bg-gradient-to-br from-emerald-950/80 to-slate-900 p-5 sm:p-6 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-900/20 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Leaf className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-emerald-50">Plant scavenger hunt</h2>
          <p className="text-sm text-emerald-100/70 mt-2 leading-relaxed">
            Search for local plants on the trail. Snap a field photo to log each find and unlock
            cards.
          </p>
          <span className="inline-block mt-4 text-xs font-bold text-emerald-400 uppercase tracking-wide">
            Start mission →
          </span>
        </button>

        <button
          type="button"
          onClick={() => setView('cards')}
          className="group text-left rounded-3xl border border-violet-700/40 bg-gradient-to-br from-violet-950/70 to-slate-900 p-5 sm:p-6 hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-900/20 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Sparkles className="w-6 h-6 text-violet-300" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-violet-50">Trail Card collection</h2>
          <p className="text-sm text-violet-100/70 mt-2 leading-relaxed">
            Collect plant cards and trail creatures like a deck of adventure legends. Rare borders
            sparkle!
          </p>
          <span className="inline-block mt-4 text-xs font-bold text-violet-400 uppercase tracking-wide">
            Open album →
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setView('howto')}
        className="w-full text-left rounded-2xl border border-slate-700 bg-slate-900/60 px-5 py-4 flex items-center gap-3 hover:border-amber-700/50 transition"
      >
        <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-slate-200">How to play & parent tips</div>
          <div className="text-xs text-slate-400">Safety rules and how hunts unlock cards</div>
        </div>
      </button>
    </div>
  );
}
