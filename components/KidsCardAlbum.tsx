'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Gift, Leaf, Pin, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  getRarityColor as getPlantRarityColor,
  getRarityLabel as getPlantRarityLabel,
  KIDS_CARDS,
  type CardRarity,
  type KidsCard,
} from '@/lib/kidsCards';
import {
  TRAIL_BADGES,
  getRarityColor as getBadgeRarityColor,
  getRarityLabel as getBadgeRarityLabel,
  getThemeLabel,
  type TrailBadge,
  type TrailBadgeRarity,
} from '@/lib/trailBadges';
import {
  completeDailyQuest,
  loadKidsProgress,
  openTrailPack,
  ownsBadge,
  ownsCard,
  pinBadge,
  PACK_ODDS_LABEL,
  saveKidsProgress,
  type KidsProgress,
} from '@/lib/kidsProgress';

interface KidsCardAlbumProps {
  userId: string;
  onBack: () => void;
  onProgressChange?: (progress: KidsProgress) => void;
}

type Tab = 'badges' | 'plants';
type RarityFilter = 'all' | TrailBadgeRarity | CardRarity;

const RARITY_FILTERS: RarityFilter[] = ['all', 'common', 'uncommon', 'rare', 'legendary'];

export default function KidsCardAlbum({
  userId,
  onBack,
  onProgressChange,
}: KidsCardAlbumProps) {
  const [progress, setProgress] = useState(() => loadKidsProgress(userId));
  const [tab, setTab] = useState<Tab>('badges');
  const [filter, setFilter] = useState<RarityFilter>('all');
  const [selectedPlant, setSelectedPlant] = useState<KidsCard | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<TrailBadge | null>(null);
  const [packReveal, setPackReveal] = useState<TrailBadge[] | null>(null);
  const [packPhase, setPackPhase] = useState<'idle' | 'opening' | 'reveal'>('idle');

  useEffect(() => {
    const base = loadKidsProgress(userId);
    const next = completeDailyQuest(base, 'view_album');
    const saved = saveKidsProgress(userId, next);
    setProgress(saved);
    onProgressChange?.(saved);
    // Run once when album opens for this user
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const plantOwned = progress.ownedCardIds.filter((id) =>
    KIDS_CARDS.some((c) => c.id === id)
  ).length;
  const badgeOwned = progress.ownedBadgeIds.length;
  const badgePct = Math.round((badgeOwned / TRAIL_BADGES.length) * 100);
  const plantPct = Math.round((plantOwned / KIDS_CARDS.length) * 100);
  const findCount = Object.keys(progress.finds).length;
  const packsLeft = Math.max(0, 8 - (progress.trailPacksOpened || 0));
  const canPack = findCount > 0 && packsLeft > 0 && packPhase !== 'opening';

  const filteredBadges = useMemo(() => {
    if (filter === 'all') return TRAIL_BADGES;
    return TRAIL_BADGES.filter((b) => b.rarity === filter);
  }, [filter]);

  const filteredPlants = useMemo(() => {
    if (filter === 'all') return KIDS_CARDS;
    return KIDS_CARDS.filter((c) => c.rarity === filter);
  }, [filter]);

  const persist = (next: KidsProgress) => {
    const saved = saveKidsProgress(userId, next);
    setProgress(saved);
    onProgressChange?.(saved);
  };

  const handleOpenPack = () => {
    if (!canPack) {
      if (findCount < 1) toast.info('Find at least one plant on the scavenger hunt first!');
      else if (packsLeft <= 0) toast.info('You opened all free Trail Drops for now.');
      return;
    }
    setPackPhase('opening');
    window.setTimeout(() => {
      const current = loadKidsProgress(userId);
      const result = openTrailPack(current);
      if (result.error) {
        toast.info(result.error);
        setPackPhase('idle');
        return;
      }
      persist(result.progress);
      setPackReveal(result.awarded);
      setPackPhase('reveal');
      setTab('badges');
    }, 700);
  };

  const closePack = () => {
    setPackReveal(null);
    setPackPhase('idle');
  };

  const handlePin = (badgeId: string) => {
    if (!ownsBadge(progress, badgeId)) return;
    persist(pinBadge(progress, badgeId));
  };

  return (
    <div className="space-y-5 kids-pop-in">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> HQ
        </button>
        <button
          type="button"
          onClick={handleOpenPack}
          disabled={!canPack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-black shadow-lg shadow-violet-600/30 disabled:opacity-40 disabled:shadow-none"
        >
          <Gift className="w-4 h-4" />
          {packPhase === 'opening' ? 'Opening…' : `Trail Drop (${packsLeft})`}
        </button>
      </div>

      <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/80 via-slate-950 to-fuchsia-950/40 p-5">
        <h2 className="text-2xl font-black text-white tracking-tight">Your collection</h2>
        <p className="text-sm text-slate-400 mt-1">
          Field Stickers from hunts · Trail Badges from Drops
        </p>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/35 border border-violet-500/20 p-3">
            <div className="flex justify-between text-xs font-bold text-violet-200 mb-1">
              <span>Trail Badges</span>
              <span>
                {badgeOwned}/{TRAIL_BADGES.length} · {badgePct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all"
                style={{ width: `${badgePct}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-black/35 border border-emerald-500/20 p-3">
            <div className="flex justify-between text-xs font-bold text-emerald-200 mb-1">
              <span>Field Stickers</span>
              <span>
                {plantOwned}/{KIDS_CARDS.length} · {plantPct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all"
                style={{ width: `${plantPct}%` }}
              />
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">{PACK_ODDS_LABEL}</p>
        {findCount === 0 && (
          <p className="mt-2 text-xs text-slate-400">
            Find 1 plant on a hunt to unlock Trail Drops.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setTab('badges');
            setFilter('all');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 ${
            tab === 'badges' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Trail Badges
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('plants');
            setFilter('all');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 ${
            tab === 'plants' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          Field Stickers
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {RARITY_FILTERS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setFilter(r)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize ${
              filter === r
                ? 'bg-white text-slate-900'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {tab === 'badges' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredBadges.map((badge) => {
            const owned = ownsBadge(progress, badge.id);
            const color = getBadgeRarityColor(badge.rarity);
            const pinned = (progress.pinnedBadgeIds || []).includes(badge.id);
            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(badge)}
                className={`group relative rounded-2xl p-[2px] transition hover:scale-[1.03] active:scale-[0.98] kids-rarity-glow-${badge.rarity}`}
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
                          const el = e.target as HTMLImageElement;
                          if (el.src.endsWith('.png')) {
                            el.src = badge.imageSrc.replace(/\.png$/, '.svg');
                          }
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
                    {pinned && (
                      <span className="absolute top-1 right-1 text-[9px] font-bold bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5" /> Pin
                      </span>
                    )}
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
          {filteredPlants.map((card) => {
            const ownedThis = ownsCard(progress, card.id);
            const color = getPlantRarityColor(card.rarity);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedPlant(card)}
                className={`group relative rounded-2xl p-[2px] transition hover:scale-[1.03] kids-rarity-glow-${card.rarity}`}
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
              <h3 className="text-2xl font-black text-white">
                {ownsCard(progress, selectedPlant.id) ? selectedPlant.name : 'Mystery sticker'}
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
              <div className="text-[10px] text-slate-500 uppercase font-bold">Field Sticker</div>
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
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    if (el.src.endsWith('.png')) {
                      el.src = selectedBadge.imageSrc.replace(/\.png$/, '.svg');
                    }
                  }}
                />
              ) : (
                <div className="w-full aspect-square bg-slate-900 flex items-center justify-center text-6xl opacity-40">
                  ❓
                </div>
              )}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold">
                      #{String(selectedBadge.number).padStart(3, '0')} ·{' '}
                      {getThemeLabel(selectedBadge.theme)}
                    </div>
                    <h3 className="text-2xl font-black text-white">
                      {ownsBadge(progress, selectedBadge.id)
                        ? selectedBadge.name
                        : 'Mystery badge'}
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
                  <>
                    <p className="text-sm text-slate-300">{selectedBadge.description}</p>
                    <button
                      type="button"
                      onClick={() => handlePin(selectedBadge.id)}
                      className="w-full h-11 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Pin className="w-4 h-4" />
                      {(progress.pinnedBadgeIds || []).includes(selectedBadge.id)
                        ? 'Unpin from showcase'
                        : 'Pin to showcase (max 3)'}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    Unlock from a Trail Drop after finding a plant.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {(packPhase === 'opening' || packReveal) && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          {packPhase === 'opening' && !packReveal && (
            <div className="text-center space-y-4 kids-pack-reveal">
              <div className="text-6xl animate-bounce">🎁</div>
              <p className="text-xl font-black text-white">Opening Trail Drop…</p>
            </div>
          )}
          {packReveal && (
            <div
              className="w-full max-w-md bg-gradient-to-b from-violet-950 to-slate-950 border-2 border-fuchsia-500/50 rounded-3xl p-6 space-y-5 kids-pack-reveal shadow-[0_0_60px_rgba(192,132,252,0.35)]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-fuchsia-200 to-amber-200">
                You got {packReveal.length} badge{packReveal.length === 1 ? '' : 's'}!
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {packReveal.map((badge) => (
                  <div
                    key={badge.id}
                    className={`w-28 rounded-2xl p-[2px] kids-pack-card kids-rarity-glow-${badge.rarity}`}
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
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          if (el.src.endsWith('.png')) {
                            el.src = badge.imageSrc.replace(/\.png$/, '.svg');
                          }
                        }}
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
                onClick={closePack}
                className="w-full h-12 rounded-2xl bg-white text-slate-900 font-black text-sm"
              >
                Claim!
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
