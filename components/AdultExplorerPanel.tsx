'use client';

import { useState } from 'react';
import { BookOpen, Leaf, MapPin, Sparkles } from 'lucide-react';
import KidsScavengerHunt from './KidsScavengerHunt';
import KidsCardAlbum from './KidsCardAlbum';
import { loadKidsProgress } from '@/lib/kidsProgress';
import { TRAIL_BADGES } from '@/lib/trailBadges';

type View = 'hub' | 'hunt' | 'cards' | 'howto';

interface AdultExplorerPanelProps {
  userId: string;
  stateCode?: string | null;
  displayHandle?: string | null;
}

/**
 * Adult Field Explorer — geo-catch, photos, stickers, packs.
 * Not for under-13 collection of location/photos.
 */
export default function AdultExplorerPanel({
  userId,
  stateCode,
  displayHandle,
}: AdultExplorerPanelProps) {
  const [view, setView] = useState<View>('hub');
  const [tick, setTick] = useState(0);
  const [adultOk, setAdultOk] = useState(false);
  void tick;

  const progress = loadKidsProgress(userId);
  const plantsFound = Object.keys(progress.finds).length;
  const badges = progress.ownedBadgeIds.length;
  const name = displayHandle?.trim() || 'Explorer';
  const refresh = () => setTick((n) => n + 1);

  if (!adultOk) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div className="rounded-3xl border border-sky-700/40 bg-gradient-to-br from-sky-950/50 via-slate-900 to-slate-950 p-6 space-y-4">
          <div className="inline-flex items-center gap-2 text-sky-300 text-xs font-bold uppercase tracking-wide">
            <MapPin className="w-4 h-4" />
            Field Explorer
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Adult explorers only</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Geo-catch uses your device location and field photos to log plants and unlock stickers.
            This section is for adults (18+) or teens using their own account — not for collecting
            children&apos;s personal information.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>Location and photos stay on this device in the demo</li>
            <li>Kids Zone (separate tab) has no GPS or photo capture</li>
            <li>Supervise any shared device; do not create child profiles here</li>
          </ul>
          <button
            type="button"
            onClick={() => setAdultOk(true)}
            className="w-full min-h-[48px] rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm"
          >
            I am 18+ — continue to Field Explorer
          </button>
          <p className="text-[10px] text-slate-500 text-center">
            This is a product gate, not legal COPPA certification. See our privacy policy for family
            features.
          </p>
        </div>
      </div>
    );
  }

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
        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 space-y-3 text-sm text-slate-300">
          <h2 className="text-xl font-bold text-white">How Field Explorer works</h2>
          <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
            <li>
              <strong className="text-white">Use my location</strong> to load a regional plant trail.
            </li>
            <li>
              <strong className="text-white">Geo-catch</strong> with a field photo — GPS tags the find
              when allowed.
            </li>
            <li>
              <strong className="text-white">Collection</strong> unlocks stickers; free packs (2) give
              Trail Badges.
            </li>
          </ol>
          <p className="text-xs text-slate-500 pt-2">
            Kids play in Kids Zone without GPS or photo logging. Keep Field Explorer for adult
            accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <div className="rounded-3xl border border-sky-800/40 bg-gradient-to-br from-sky-950/60 via-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="text-sky-400 text-xs font-bold uppercase tracking-wide mb-1">
          Adult Field Explorer
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {name !== 'Explorer' ? `${name}'s field log` : 'Field log'}
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-md leading-relaxed">
          Geo-catch plants, tag GPS, unlock stickers and badges. For adults exploring trails and
          campgrounds.
        </p>
        <p className="mt-3 text-sm font-semibold text-sky-200/90">
          {plantsFound} plant{plantsFound === 1 ? '' : 's'} logged · {badges}/{TRAIL_BADGES.length}{' '}
          badges
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setView('hunt')}
          className="text-left rounded-3xl border border-emerald-700/40 bg-emerald-950/40 hover:border-emerald-500/50 p-5 sm:p-6 transition"
        >
          <Leaf className="w-8 h-8 text-emerald-400 mb-3" />
          <div className="text-lg font-bold text-white">Geo-catch plants</div>
          <p className="text-sm text-slate-400 mt-1">Location + field photo · unlock stickers</p>
        </button>

        <button
          type="button"
          onClick={() => setView('cards')}
          className="text-left rounded-3xl border border-violet-700/40 bg-violet-950/30 hover:border-violet-500/50 p-5 sm:p-6 transition"
        >
          <Sparkles className="w-8 h-8 text-violet-300 mb-3" />
          <div className="text-lg font-bold text-white">Collection</div>
          <p className="text-sm text-slate-400 mt-1">Stickers, badges, free packs (2)</p>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setView('howto')}
        className="w-full text-left rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 flex items-center gap-3 text-sm text-slate-400 hover:text-slate-200"
      >
        <BookOpen className="w-4 h-4 shrink-0" />
        How it works & privacy notes
      </button>
    </div>
  );
}
