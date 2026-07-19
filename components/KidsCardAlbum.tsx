'use client';

import { useState } from 'react';
import { ChevronLeft, Gift, Leaf, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  getRarityColor as getPlantRarityColor,
  getRarityLabel as getPlantRarityLabel,
  KIDS_CARDS,
  type KidsCard,
} from '@/lib/kidsCards';
import {
  TRAIL_BADGES,
  getRarityColor as getBadgeRarityColor,
  getRarityLabel as getBadgeRarityLabel,
  getThemeLabel,
  type TrailBadge,
} from '@/lib/trailBadges';
import {
  loadKidsProgress,
  FREE_TRAIL_PACKS_MAX,
  openTrailPack,
  ownsBadge,
  ownsCard,
  saveKidsProgress,
  type KidsProgress,
} from '@/lib/kidsProgress';
import { formatCoords } from '@/lib/geoState';

interface KidsCardAlbumProps {
  userId: string;
  onBack: () => void;
  onProgressChange?: (progress: KidsProgress) => void;
}

type Tab = 'plants' | 'badges';

export default function KidsCardAlbum({
  userId,
  onBack,
  onProgressChange,
}: KidsCardAlbumProps) {
  const [progress, setProgress] = useState(() => loadKidsProgress(userId));
  const [tab, setTab] = useState<Tab>('plants');
  const [selectedPlant, setSelectedPlant] = useState<KidsCard | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<TrailBadge | null>(null);
  const [packReveal, setPackReveal] = useState<TrailBadge[] | null>(null);

  const plantOwned = progress.ownedCardIds.filter((id) =>
    KIDS_CARDS.some((c) => c.id === id)
  ).length;
  const badgeOwned = progress.ownedBadgeIds.length;
  const finds = Object.keys(progress.finds).length;
  const packsLeft = Math.max(0, FREE_TRAIL_PACKS_MAX - (progress.trailPacksOpened || 0));

  const persist = (next: KidsProgress) => {
    const saved = saveKidsProgress(userId, next);
    setProgress(saved);
    onProgressChange?.(saved);
  };

  const handleOpenPack = () => {
    const result = openTrailPack(progress);
    if (result.error) {
      toast.info(result.error);
      return;
    }
    persist(result.progress);
    setPackReveal(result.awarded);
    setTab('badges');
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-white">My collection</h2>
        <p className="text-sm text-slate-400 mt-1">
          Plants {plantOwned}/{KIDS_CARDS.length} · Badges {badgeOwned}/{TRAIL_BADGES.length}
        </p>

        <button
          type="button"
          onClick={handleOpenPack}
          disabled={finds < 1 || packsLeft < 1}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-11 rounded-2xl bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:hover:bg-violet-700 text-white text-sm font-semibold"
        >
          <Gift className="w-4 h-4" />
          {packsLeft < 1
            ? 'No free packs left'
            : finds < 1
              ? 'Find a plant first'
              : `Open free pack (${packsLeft} left)`}
        </button>
        <p className="mt-2 text-xs text-slate-500">
          {FREE_TRAIL_PACKS_MAX} free packs give random camping badges. No real money.
        </p>
      </div>

      <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setTab('plants')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${
            tab === 'plants' ? 'bg-emerald-700 text-white' : 'text-slate-400'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          Plants
        </button>
        <button
          type="button"
          onClick={() => setTab('badges')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${
            tab === 'badges' ? 'bg-violet-700 text-white' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Badges
        </button>
      </div>

      {tab === 'plants' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {KIDS_CARDS.map((card) => {
            const owned = ownsCard(progress, card.id);
            const color = getPlantRarityColor(card.rarity);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedPlant(card)}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 min-h-[120px] text-left hover:border-slate-600 transition"
              >
                <div className={`text-3xl mb-2 ${owned ? '' : 'grayscale opacity-30'}`}>
                  {owned ? card.emoji : '❓'}
                </div>
                <div className={`text-xs font-bold ${owned ? 'text-slate-100' : 'text-slate-500'}`}>
                  {owned ? card.name : '???'}
                </div>
                {owned && (
                  <div className="text-[10px] mt-1 font-medium" style={{ color }}>
                    {getPlantRarityLabel(card.rarity)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {tab === 'badges' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {TRAIL_BADGES.map((badge) => {
            const owned = ownsBadge(progress, badge.id);
            const color = getBadgeRarityColor(badge.rarity);
            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(badge)}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden text-left hover:border-slate-600 transition"
              >
                <div className="aspect-square bg-slate-900 relative">
                  {owned ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={badge.imageSrc}
                      alt={badge.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        if (el.src.endsWith('.png')) {
                          el.src = badge.imageSrc.replace(/\.png$/, '.svg');
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                      ❓
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <div className={`text-[11px] font-bold ${owned ? 'text-slate-100' : 'text-slate-500'}`}>
                    {owned ? badge.name : '???'}
                  </div>
                  {owned && (
                    <div className="text-[10px] font-medium mt-0.5" style={{ color }}>
                      {getBadgeRarityLabel(badge.rarity)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedPlant && (
        <div
          className="fixed inset-0 z-[110] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedPlant(null)}
        >
          <div
            className="w-full sm:max-w-sm bg-slate-950 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <span className="text-5xl">
                {ownsCard(progress, selectedPlant.id) ? selectedPlant.emoji : '❓'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPlant(null)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <h3 className="text-xl font-bold text-white">
              {ownsCard(progress, selectedPlant.id) ? selectedPlant.name : 'Not found yet'}
            </h3>
            {ownsCard(progress, selectedPlant.id) ? (
              <>
                <p className="text-sm text-slate-300">{selectedPlant.description}</p>
                {(() => {
                  const plantId = selectedPlant.plantId;
                  const find = plantId ? progress.finds[plantId] : undefined;
                  if (find?.lat != null && find?.lng != null) {
                    return (
                      <p className="text-xs text-sky-300">
                        Field GPS: {formatCoords(find.lat, find.lng)}
                        {find.stateCode ? ` · ${find.stateCode}` : ''}
                      </p>
                    );
                  }
                  return (
                    <p className="text-xs text-slate-500">No GPS tag on this catch.</p>
                  );
                })()}
              </>
            ) : (
              <p className="text-sm text-slate-500">Find this plant on the scavenger hunt.</p>
            )}
          </div>
        </div>
      )}

      {selectedBadge && (
        <div
          className="fixed inset-0 z-[110] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="w-full sm:max-w-sm bg-slate-950 border border-slate-700 rounded-t-3xl sm:rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {ownsBadge(progress, selectedBadge.id) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedBadge.imageSrc}
                alt={selectedBadge.name}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  if (el.src.endsWith('.png')) {
                    el.src = selectedBadge.imageSrc.replace(/\.png$/, '.svg');
                  }
                }}
              />
            ) : (
              <div className="w-full aspect-square bg-slate-900 flex items-center justify-center text-5xl opacity-40">
                ❓
              </div>
            )}
            <div className="p-6 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    #{String(selectedBadge.number).padStart(3, '0')} ·{' '}
                    {getThemeLabel(selectedBadge.theme)}
                  </p>
                  <h3 className="text-xl font-bold text-white">
                    {ownsBadge(progress, selectedBadge.id)
                      ? selectedBadge.name
                      : 'Not unlocked yet'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="text-slate-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              {ownsBadge(progress, selectedBadge.id) ? (
                <p className="text-sm text-slate-300">{selectedBadge.description}</p>
              ) : (
                <p className="text-sm text-slate-500">Open a free pack after you find a plant.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {packReveal && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPackReveal(null)}
        >
          <div
            className="w-full max-w-md bg-slate-950 border border-violet-600/40 rounded-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-center text-white">
              You got {packReveal.length} badge{packReveal.length === 1 ? '' : 's'}!
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {packReveal.map((badge) => (
                <div key={badge.id} className="w-24 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={badge.imageSrc}
                    alt={badge.name}
                    className="w-full aspect-square object-cover rounded-xl border border-slate-700"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      if (el.src.endsWith('.png')) {
                        el.src = badge.imageSrc.replace(/\.png$/, '.svg');
                      }
                    }}
                  />
                  <div className="text-[11px] font-semibold text-slate-200 mt-1">{badge.name}</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPackReveal(null)}
              className="w-full h-11 rounded-2xl bg-white text-slate-900 font-semibold text-sm"
            >
              Nice!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
