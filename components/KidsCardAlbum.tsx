'use client';

import { useState } from 'react';
import { ChevronLeft, Package, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  getRarityColor,
  getRarityLabel,
  KIDS_CARDS,
  type KidsCard,
} from '@/lib/kidsCards';
import {
  getOwnedCards,
  loadKidsProgress,
  openTrailPack,
  ownsCard,
  saveKidsProgress,
  type KidsProgress,
} from '@/lib/kidsProgress';

interface KidsCardAlbumProps {
  userId: string;
  onBack: () => void;
  onProgressChange?: (progress: KidsProgress) => void;
}

export default function KidsCardAlbum({
  userId,
  onBack,
  onProgressChange,
}: KidsCardAlbumProps) {
  const [progress, setProgress] = useState(() => loadKidsProgress(userId));
  const [selected, setSelected] = useState<KidsCard | null>(null);
  const [packReveal, setPackReveal] = useState<KidsCard[] | null>(null);

  const owned = getOwnedCards(progress);
  const ownedCount = owned.length;
  const total = KIDS_CARDS.length;

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
    toast.success(`Trail pack opened! ${result.awarded.length} new card(s)!`);
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
              Trail Card album
            </h2>
            <p className="text-sm text-sky-100/75 mt-1 max-w-md leading-relaxed">
              Collect plant cards from scavenger hunts and bonus trail creatures. Show them off on
              your profile!
            </p>
            <p className="mt-3 text-sm font-semibold text-amber-200">
              {ownedCount} / {total} cards collected
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
          Free demo packs (up to 5). Find a plant first. No real purchases.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {KIDS_CARDS.map((card) => {
          const ownedThis = ownsCard(progress, card.id);
          const color = getRarityColor(card.rarity);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelected(card)}
              className="group relative rounded-2xl p-[2px] transition hover:scale-[1.03] active:scale-[0.98]"
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
                <div className="mt-auto pt-2 text-[10px] font-semibold" style={{ color: ownedThis ? color : '#64748b' }}>
                  {getRarityLabel(card.rarity)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full sm:max-w-sm p-[3px] rounded-t-3xl sm:rounded-3xl"
            style={{
              background: `linear-gradient(160deg, ${getRarityColor(selected.rarity)}, #0f172a 50%, ${getRarityColor(selected.rarity)})`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-950 rounded-t-[20px] sm:rounded-[20px] p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-6xl">{ownsCard(progress, selected.id) ? selected.emoji : '❓'}</span>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {ownsCard(progress, selected.id) ? selected.name : 'Mystery card'}
                </h3>
                <p
                  className="text-sm font-semibold mt-1"
                  style={{ color: getRarityColor(selected.rarity) }}
                >
                  {getRarityLabel(selected.rarity)} · {selected.powerLabel}
                </p>
              </div>
              {ownsCard(progress, selected.id) ? (
                <p className="text-sm text-slate-300 leading-relaxed">{selected.description}</p>
              ) : (
                <p className="text-sm text-slate-500">
                  Unlock this card on a scavenger hunt or from a trail pack.
                </p>
              )}
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                {selected.type === 'plant' ? 'Plant card' : 'Trail creature'}
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
            <h3 className="text-xl font-bold text-center text-violet-100">Trail pack reveal!</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {packReveal.map((card) => (
                <div
                  key={card.id}
                  className="w-28 rounded-2xl p-[2px]"
                  style={{
                    background: `linear-gradient(145deg, ${getRarityColor(card.rarity)}, #1e293b)`,
                  }}
                >
                  <div className="bg-slate-950 rounded-[14px] p-3 text-center">
                    <div className="text-3xl">{card.emoji}</div>
                    <div className="text-[11px] font-bold mt-1 text-slate-100">{card.name}</div>
                    <div
                      className="text-[10px] font-semibold mt-0.5"
                      style={{ color: getRarityColor(card.rarity) }}
                    >
                      {getRarityLabel(card.rarity)}
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
