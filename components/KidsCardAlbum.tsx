'use client';

import { useState } from 'react';
import { ChevronLeft, Package, Sparkles, Leaf } from 'lucide-react';
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
  getOwnedCards,
  getOwnedBadges,
  loadKidsProgress,
  openTrailPack,
  ownsCard,
  ownsBadge,
  saveKidsProgress,
  type KidsProgress,
} from '@/lib/kidsProgress';

interface KidsCardAlbumProps {
  userId: string;
  onBack: () => void;
  onProgressChange?: (progress: KidsProgress) => void;
}

type AlbumTab = 'plants' | 'badges';

export default function KidsCardAlbum({
  userId,
  onBack,
  onProgressChange,
}: KidsCardAlbumProps) {
  const [progress, setProgress] = useState(() => loadKidsProgress(userId));
  const [tab, setTab] = useState<AlbumTab>('badges');
  const [selectedPlant, setSelectedPlant] = useState<KidsCard | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<TrailBadge | null>(null);
  const [packReveal, setPackReveal] = useState<TrailBadge[] | null>(null);

  const plantOwned = getOwnedCards(progress).length;
  const badgeOwned = getOwnedBadges(progress).length;

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
    toast.success(`Trail pack opened! ${result.awarded.length} badge(s)!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-amber-200/90 hover:text-amber-100"
        >
          <ChevronLeft className="w-4 h-4" /> Base camp
        </button>
      </div>

      <div className="rounded-3xl border border-sky-700/40 bg-gradient-to-br from-sky-950/70 via-slate-900 to-violet-950/40 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-sky-50 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Collector album
            </h2>
            <p className="text-sm text-sky-100/75 mt-1 max-w-md leading-relaxed">
              Plant cards from scavenger hunts · Trail Badges from packs (camping wildlife &
              landscapes).
            </p>
            <p className="mt-3 text-sm font-semibold text-amber-200">
              Plants {plantOwned}/{KIDS_CARDS.length} · Badges {badgeOwned}/{TRAIL_BADGES.length}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenPack}
            className="flex items-center gap-2 px-4 h-11 rounded-2xl bg-violet-700 hover:bg-violet-600 text-white text-sm font-semibold shadow-lg shadow-violet-900/30"
          >
            <Package className="w-4 h-4" />
            Open trail pack
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          Packs award Trail Badges (up to 8 free). Find a plant first. No real purchases.
        </p>
      </div>

      <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setTab('badges')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${
            tab === 'badges' ? 'bg-violet-700 text-white' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Trail Badges ({badgeOwned}/{TRAIL_BADGES.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('plants')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${
            tab === 'plants' ? 'bg-emerald-700 text-white' : 'text-slate-400'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          Plants ({plantOwned}/{KIDS_CARDS.length})
        </button>
      </div>

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
                className="group relative rounded-2xl p-[2px] transition hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: owned
                    ? `linear-gradient(145deg, ${color}, #1e293b 55%, ${color})`
                    : 'linear-gradient(145deg, #334155, #0f172a)',
                }}
              >
                <div
                  className={`rounded-[14px] overflow-hidden h-full min-h-[150px] flex flex-col ${
                    owned ? 'bg-slate-950/90' : 'bg-slate-950/95'
                  }`}
                >
                  <div className="relative aspect-square bg-slate-900">
                    {owned ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={badge.imageSrc}
                        alt={badge.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-30 grayscale">
                        ❓
                      </div>
                    )}
                    <span className="absolute top-1 left-1 text-[9px] font-bold bg-black/50 px-1.5 py-0.5 rounded text-slate-300">
                      #{String(badge.number).padStart(3, '0')}
                    </span>
                  </div>
                  <div className="p-2 flex-1 flex flex-col">
                    <div
                      className={`text-[11px] font-bold leading-tight ${
                        owned ? 'text-slate-100' : 'text-slate-500'
                      }`}
                    >
                      {owned ? badge.name : '???'}
                    </div>
                    <div
                      className="mt-auto pt-1 text-[10px] font-semibold"
                      style={{ color: owned ? color : '#64748b' }}
                    >
                      {getBadgeRarityLabel(badge.rarity)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'plants' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {KIDS_CARDS.map((card) => {
            const ownedThis = ownsCard(progress, card.id);
            const color = getPlantRarityColor(card.rarity);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedPlant(card)}
                className="group relative rounded-2xl p-[2px] transition hover:scale-[1.03]"
                style={{
                  background: ownedThis
                    ? `linear-gradient(145deg, ${color}, #1e293b 55%, ${color})`
                    : 'linear-gradient(145deg, #334155, #0f172a)',
                }}
              >
                <div
                  className={`rounded-[14px] p-3 h-full min-h-[140px] flex flex-col ${
                    ownedThis ? 'bg-slate-950/90' : 'bg-slate-950/95'
                  }`}
                >
                  <div
                    className={`text-4xl mb-2 ${ownedThis ? '' : 'grayscale opacity-30 blur-[1px]'}`}
                  >
                    {ownedThis ? card.emoji : '❓'}
                  </div>
                  <div
                    className={`text-xs font-bold leading-tight ${
                      ownedThis ? 'text-slate-100' : 'text-slate-500'
                    }`}
                  >
                    {ownedThis ? card.name : '???'}
                  </div>
                  <div
                    className="mt-auto pt-2 text-[10px] font-semibold"
                    style={{ color: ownedThis ? color : '#64748b' }}
                  >
                    {getPlantRarityLabel(card.rarity)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedPlant && (
        <div
          className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedPlant(null)}
        >
          <div
            className="w-full sm:max-w-sm p-[3px] rounded-t-3xl sm:rounded-3xl"
            style={{
              background: `linear-gradient(160deg, ${getPlantRarityColor(selectedPlant.rarity)}, #0f172a 50%, ${getPlantRarityColor(selectedPlant.rarity)})`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-950 rounded-t-[20px] sm:rounded-[20px] p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-6xl">
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
              <h3 className="text-2xl font-bold text-white">
                {ownsCard(progress, selectedPlant.id) ? selectedPlant.name : 'Mystery card'}
              </h3>
              <p
                className="text-sm font-semibold"
                style={{ color: getPlantRarityColor(selectedPlant.rarity) }}
              >
                {getPlantRarityLabel(selectedPlant.rarity)} · {selectedPlant.powerLabel}
              </p>
              {ownsCard(progress, selectedPlant.id) ? (
                <p className="text-sm text-slate-300">{selectedPlant.description}</p>
              ) : (
                <p className="text-sm text-slate-500">Unlock on a plant scavenger hunt.</p>
              )}
              <div className="text-[10px] text-slate-500 uppercase">Plant card</div>
            </div>
          </div>
        </div>
      )}

      {selectedBadge && (
        <div
          className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="w-full sm:max-w-sm p-[3px] rounded-t-3xl sm:rounded-3xl"
            style={{
              background: `linear-gradient(160deg, ${getBadgeRarityColor(selectedBadge.rarity)}, #0f172a 50%, ${getBadgeRarityColor(selectedBadge.rarity)})`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-950 rounded-t-[20px] sm:rounded-[20px] overflow-hidden">
              {ownsBadge(progress, selectedBadge.id) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedBadge.imageSrc}
                  alt={selectedBadge.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-slate-900 flex items-center justify-center text-6xl opacity-40">
                  ❓
                </div>
              )}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold">
                      #{String(selectedBadge.number).padStart(3, '0')} ·{' '}
                      {getThemeLabel(selectedBadge.theme)}
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {ownsBadge(progress, selectedBadge.id) ? selectedBadge.name : 'Mystery badge'}
                    </h3>
                    <p
                      className="text-sm font-semibold mt-1"
                      style={{ color: getBadgeRarityColor(selectedBadge.rarity) }}
                    >
                      {getBadgeRarityLabel(selectedBadge.rarity)}
                    </p>
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
                  <p className="text-sm text-slate-500">
                    Unlock from a trail pack after finding a plant.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {packReveal && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPackReveal(null)}
        >
          <div
            className="w-full max-w-md bg-gradient-to-b from-violet-950 to-slate-950 border border-violet-600/40 rounded-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-center text-violet-100">Trail Badge pack!</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {packReveal.map((badge) => (
                <div
                  key={badge.id}
                  className="w-28 rounded-2xl p-[2px]"
                  style={{
                    background: `linear-gradient(145deg, ${getBadgeRarityColor(badge.rarity)}, #1e293b)`,
                  }}
                >
                  <div className="bg-slate-950 rounded-[14px] overflow-hidden text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={badge.imageSrc}
                      alt={badge.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2">
                      <div className="text-[11px] font-bold text-slate-100">{badge.name}</div>
                      <div
                        className="text-[10px] font-semibold mt-0.5"
                        style={{ color: getBadgeRarityColor(badge.rarity) }}
                      >
                        {getBadgeRarityLabel(badge.rarity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPackReveal(null)}
              className="w-full h-11 rounded-2xl bg-white text-slate-900 font-semibold text-sm"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
