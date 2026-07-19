'use client';

import { useMemo, useRef, useState } from 'react';
import { Camera, Check, ChevronLeft, MapPin, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { compressImageFile } from '@/lib/imageCompress';
import { getPlantsForTrail, type KidsPlant } from '@/lib/kidsPlants';
import { getCardForPlant, getRarityColor, getRarityLabel } from '@/lib/kidsCards';
import {
  isPlantFound,
  loadKidsProgress,
  recordPlantFind,
  saveKidsProgress,
  type KidsProgress,
} from '@/lib/kidsProgress';
import { awardRoadCrewForUser } from '@/lib/roadCrew';
import { getMembershipPlanId } from '@/lib/membershipSubscription';

interface KidsScavengerHuntProps {
  userId: string;
  stateCode?: string | null;
  onBack: () => void;
  onProgressChange?: (progress: KidsProgress) => void;
}

export default function KidsScavengerHunt({
  userId,
  stateCode,
  onBack,
  onProgressChange,
}: KidsScavengerHuntProps) {
  const [progress, setProgress] = useState(() => loadKidsProgress(userId));
  const [selected, setSelected] = useState<KidsPlant | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const plants = useMemo(() => getPlantsForTrail(stateCode), [stateCode]);
  const foundCount = plants.filter((p) => isPlantFound(progress, p.id)).length;

  const persist = (next: KidsProgress) => {
    const saved = saveKidsProgress(userId, next);
    setProgress(saved);
    onProgressChange?.(saved);
  };

  const handlePhotoPick = async (file: File) => {
    if (!selected) return;
    setUploading(true);
    try {
      const dataUrl = await compressImageFile(file, 900, 0.8, 400_000);
      const { progress: next, newCardId, alreadyFound } = recordPlantFind(
        progress,
        selected.id,
        dataUrl
      );
      if (alreadyFound) {
        toast.info('You already found this plant!');
        return;
      }
      persist(next);
      const card = newCardId ? getCardForPlant(selected.id) : null;
      toast.success(
        card
          ? `Found ${selected.commonName}! Card unlocked: ${card.name}`
          : `Found ${selected.commonName}! Great field work!`
      );
      // Road Crew: award to parent account if explorer id is guest-style; use progress userId host
      const crewUser =
        userId.startsWith('explorer:') ? null : userId;
      if (crewUser && !crewUser.startsWith('guest')) {
        const pts = awardRoadCrewForUser(
          crewUser,
          getMembershipPlanId(crewUser),
          'kids_plant_found',
          selected.commonName
        );
        if (pts > 0) toast.message(`Road Crew +${pts} pts`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save photo.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-amber-200/90 hover:text-amber-100"
        >
          <ChevronLeft className="w-4 h-4" /> HQ
        </button>
      </div>

      <div className="rounded-3xl border border-amber-700/40 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-amber-950/40 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="text-3xl" aria-hidden>
            🧭
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-amber-50">
              Plant scavenger hunt
            </h2>
            <p className="text-sm text-amber-100/80 mt-1 leading-relaxed">
              Search nearby trails and campgrounds for these plants. Snap a field photo to log your
              find and unlock a Trail Card!
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900/50 border border-emerald-700/50 text-emerald-200">
                <MapPin className="w-3 h-3" />
                {stateCode ? `Trail near ${stateCode}` : 'Nationwide starter trail'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-900/40 border border-amber-700/40 text-amber-100 font-semibold">
                {foundCount} / {plants.length} found
              </span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-slate-950/80 overflow-hidden border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all"
                style={{ width: `${plants.length ? (foundCount / plants.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/70 border border-slate-700 rounded-2xl p-3">
        <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p>
          Adult supervision recommended. Look with your eyes — do not pick protected plants or touch
          unknown plants or mushrooms. Photos only; this is not a plant ID app.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {plants.map((plant) => {
          const found = isPlantFound(progress, plant.id);
          const color = getRarityColor(plant.rarity);
          return (
            <button
              key={plant.id}
              type="button"
              onClick={() => setSelected(plant)}
              className={`relative text-left rounded-2xl border p-3 transition hover:scale-[1.02] active:scale-[0.99] ${
                found
                  ? 'border-emerald-600/60 bg-emerald-950/40'
                  : 'border-slate-700 bg-slate-900/70 hover:border-amber-600/50'
              }`}
            >
              {found && (
                <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </span>
              )}
              <div className="text-3xl mb-2">{plant.emoji}</div>
              <div className="font-semibold text-sm text-slate-100 leading-tight">{plant.commonName}</div>
              <div className="text-[10px] mt-1 font-medium" style={{ color }}>
                {getRarityLabel(plant.rarity)}
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
            className="w-full sm:max-w-md bg-slate-900 border border-amber-800/40 rounded-t-3xl sm:rounded-3xl max-h-[90dvh] overflow-y-auto p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selected.emoji}</span>
                <div>
                  <h3 className="text-xl font-bold text-amber-50">{selected.commonName}</h3>
                  <p className="text-xs text-slate-400 italic">{selected.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white text-2xl leading-none px-1"
              >
                ×
              </button>
            </div>

            <div
              className="inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{
                color: getRarityColor(selected.rarity),
                borderColor: `${getRarityColor(selected.rarity)}66`,
              }}
            >
              {getRarityLabel(selected.rarity)} trail target
            </div>

            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-amber-400/90 font-semibold uppercase tracking-wide">Look for</dt>
                <dd className="text-slate-200 mt-0.5">{selected.lookFor}</dd>
              </div>
              <div>
                <dt className="text-xs text-amber-400/90 font-semibold uppercase tracking-wide">Habitat</dt>
                <dd className="text-slate-200 mt-0.5">{selected.habitat}</dd>
              </div>
              <div>
                <dt className="text-xs text-amber-400/90 font-semibold uppercase tracking-wide">Fun fact</dt>
                <dd className="text-slate-200 mt-0.5">{selected.funFact}</dd>
              </div>
              <div className="flex items-start gap-2 bg-sky-950/40 border border-sky-800/40 rounded-xl p-3">
                <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <dd className="text-xs text-sky-100/90">{selected.safetyNote}</dd>
              </div>
            </dl>

            {isPlantFound(progress, selected.id) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                  <Check className="w-4 h-4" /> Logged in your field guide
                </div>
                {progress.finds[selected.id]?.photoDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={progress.finds[selected.id].photoDataUrl!}
                    alt={`Field photo of ${selected.commonName}`}
                    className="w-full h-40 object-cover rounded-2xl border border-slate-700"
                  />
                )}
                <p className="text-xs text-slate-400">You took this field photo on your adventure!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoPick(file);
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Camera className="w-5 h-5" />
                  {uploading ? 'Saving field photo…' : 'Snap field photo & mark found'}
                </button>
                <p className="text-[10px] text-center text-slate-500">
                  Demo: your photo is proof of adventure — not AI plant ID.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
