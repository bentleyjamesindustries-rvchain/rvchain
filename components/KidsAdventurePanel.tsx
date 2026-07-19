'use client';

import { useState } from 'react';
import { BookOpen, Flame, Leaf, MapPin, Sparkles, Star } from 'lucide-react';
import KidsScavengerHunt from './KidsScavengerHunt';
import KidsCardAlbum from './KidsCardAlbum';
import {
  getDailyQuestStatus,
  loadKidsProgress,
  trailLevel,
} from '@/lib/kidsProgress';
import { KIDS_CARDS } from '@/lib/kidsCards';
import { TRAIL_BADGES } from '@/lib/trailBadges';

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
  const stickerCount = progress.ownedCardIds.length;
  const badgeCount = progress.ownedBadgeIds.length;
  const packsLeft = Math.max(0, 8 - (progress.trailPacksOpened || 0));
  const quests = getDailyQuestStatus(progress);
  const level = trailLevel(progress);
  const streak = progress.streakDays || 0;
  const handle = displayHandle?.trim() || 'Explorer';

  const bump = () => setProgressTick((n) => n + 1);

  if (view === 'hunt') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 kids-adventure">
        <KidsScavengerHunt
          userId={userId}
          stateCode={stateCode}
          onBack={() => {
            bump();
            setView('hub');
          }}
          onProgressChange={bump}
        />
      </div>
    );
  }

  if (view === 'cards') {
    return (
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 kids-adventure">
        <KidsCardAlbum
          userId={userId}
          onBack={() => {
            bump();
            setView('hub');
          }}
          onProgressChange={bump}
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
          className="text-sm text-cyan-200/90 hover:text-cyan-100"
        >
          ← Trail Crew HQ
        </button>
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            How to play
          </h2>
          <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-300 leading-relaxed">
            <li>
              <strong className="text-slate-100">Plant Hunt</strong> — go outside with a grown-up
              and look for plants on your trail list. Snap a photo to mark a find and earn a Field
              Sticker.
            </li>
            <li>
              <strong className="text-slate-100">Trail Drops</strong> — after your first find, open
              free Drops for 1–3 Trail Badges (50 to collect). Max 8 free Drops.
            </li>
            <li>
              <strong className="text-slate-100">Daily missions</strong> — find a plant, open a Drop,
              and check your collection for a soft day streak.
            </li>
            <li>
              <strong className="text-slate-100">Pin badges</strong> — pin up to 3 favorites from your
              album for your explorer vibe.
            </li>
          </ol>
          <div className="rounded-2xl border border-sky-800/50 bg-sky-950/30 p-4 text-sm text-sky-100/90 space-y-2">
            <p className="font-semibold text-sky-200">Parent tips</p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-sky-100/80 leading-relaxed">
              <li>Supervise kids outdoors and near water or roads.</li>
              <li>Do not pick protected plants or touch unknown mushrooms.</li>
              <li>Photos are for fun — not scientific plant identification.</li>
              <li>No real-money loot boxes. Progress is saved on this device (demo mode).</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 kids-adventure">
      <div className="kids-hq-bg rounded-3xl border border-white/10 p-5 sm:p-7 space-y-6 kids-pop-in">
        <div className="flex items-start gap-4">
          <div
            className="kids-level-ring"
            style={{ ['--pct' as string]: level.pct }}
            title={level.name}
          >
            <div className="kids-level-ring-inner">
              <span className="text-lg font-black text-cyan-300 leading-none">{level.level}</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase">LVL</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-fuchsia-300/90 mb-1">
              <Sparkles className="w-3 h-3" />
              Trail Crew HQ
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight truncate">
              Hey, {handle}!
            </h1>
            <p className="text-sm font-semibold text-cyan-300/90 mt-0.5">{level.name}</p>
            <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden max-w-xs">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
                style={{ width: `${level.pct}%` }}
              />
            </div>
            {isExplorer && (
              <p className="text-[11px] text-emerald-400/90 mt-1.5 font-semibold">
                Explorer signed in
              </p>
            )}
          </div>
          {streak > 0 && (
            <div className="kids-streak shrink-0">
              <Flame className="w-4 h-4" />
              {streak} day{streak === 1 ? '' : 's'}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-black/30 border border-emerald-500/25 px-3 py-2.5 text-center">
            <div className="text-lg font-black text-emerald-300">
              {stickerCount}
              <span className="text-slate-500 text-sm font-semibold">/{KIDS_CARDS.length}</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Stickers
            </div>
          </div>
          <div className="rounded-2xl bg-black/30 border border-violet-500/25 px-3 py-2.5 text-center">
            <div className="text-lg font-black text-violet-300">
              {badgeCount}
              <span className="text-slate-500 text-sm font-semibold">/{TRAIL_BADGES.length}</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Badges
            </div>
          </div>
          <div className="rounded-2xl bg-black/30 border border-amber-500/25 px-3 py-2.5 text-center">
            <div className="text-lg font-black text-amber-300">{packsLeft}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Drops left
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400" />
              Today&apos;s missions
            </h3>
            <span className="text-xs font-bold text-slate-400">{quests.doneCount}/3</span>
          </div>
          <div className="space-y-1.5">
            <QuestRow done={quests.findPlant} label="Find a plant outside" emoji="🌿" />
            <QuestRow done={quests.openPack} label="Open a Trail Drop" emoji="🎁" />
            <QuestRow done={quests.viewAlbum} label="Check your collection" emoji="📖" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <button type="button" onClick={() => setView('hunt')} className="kids-tile kids-tile-hunt">
            <MapPin className="w-7 h-7 text-lime-300 mb-2" />
            <div className="text-lg font-black text-white">Plant Hunt</div>
            <p className="text-xs text-emerald-100/80 mt-1 leading-snug">
              Photo real plants → unlock Field Stickers
              {foundCount > 0 ? ` · ${foundCount} found` : ''}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setView('cards')}
            className="kids-tile kids-tile-album"
          >
            <BookOpen className="w-7 h-7 text-violet-200 mb-2" />
            <div className="text-lg font-black text-white">Collection</div>
            <p className="text-xs text-violet-100/80 mt-1 leading-snug">
              Field Stickers + 50 Trail Badges · open Trail Drops
            </p>
          </button>
        </div>

        {!isExplorer && (
          <div className="rounded-2xl border border-pink-500/30 bg-pink-950/25 px-4 py-3 text-sm text-pink-50/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs sm:text-sm leading-relaxed">
              Kids get their own stickers &amp; badges with a family code. Parents set this up under
              Profile → My Little Explorers.
            </p>
            <div className="flex flex-wrap gap-2 shrink-0">
              {onRequestExplorerSignIn && (
                <button
                  type="button"
                  onClick={onRequestExplorerSignIn}
                  className="px-3 h-9 rounded-xl bg-pink-600 hover:bg-pink-500 text-xs font-bold"
                >
                  Explorer sign-in
                </button>
              )}
              {onRequestParentExplorers && (
                <button
                  type="button"
                  onClick={onRequestParentExplorers}
                  className="px-3 h-9 rounded-xl border border-pink-400/40 hover:bg-pink-900/40 text-xs font-bold"
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
          className="w-full text-left rounded-2xl border border-white/10 bg-black/25 px-5 py-3.5 flex items-center gap-3 hover:border-cyan-500/40 transition"
        >
          <BookOpen className="w-5 h-5 text-cyan-300 shrink-0" />
          <div>
            <div className="text-sm font-bold text-slate-100">How to play & parent tips</div>
            <div className="text-xs text-slate-400">Safety · Drops · daily missions</div>
          </div>
        </button>

        <p className="text-[11px] text-slate-500 text-center leading-relaxed">
          No real-money loot boxes · outdoor play first · parent-supervised family codes
        </p>
      </div>
    </div>
  );
}

function QuestRow({ done, label, emoji }: { done: boolean; label: string; emoji: string }) {
  return (
    <div className={`kids-quest ${done ? 'done' : ''}`}>
      <span className="text-lg" aria-hidden>
        {done ? '✅' : emoji}
      </span>
      <span
        className={`text-sm font-semibold flex-1 ${
          done ? 'text-lime-200 line-through opacity-80' : 'text-slate-200'
        }`}
      >
        {label}
      </span>
      {done ? (
        <span className="text-[10px] font-black uppercase text-lime-400">Done</span>
      ) : (
        <Leaf className="w-3.5 h-3.5 text-slate-600" />
      )}
    </div>
  );
}
