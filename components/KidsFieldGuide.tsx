'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, Shield } from 'lucide-react';
import { getPlantsForTrail, type KidsPlant } from '@/lib/kidsPlants';
import { getRarityColor, getRarityLabel } from '@/lib/kidsCards';

interface KidsFieldGuideProps {
  stateCode?: string | null;
  onBack: () => void;
}

/** Educational plant guide only — no photos, GPS, accounts, or saved finds. */
export default function KidsFieldGuide({ stateCode, onBack }: KidsFieldGuideProps) {
  const [selected, setSelected] = useState<KidsPlant | null>(null);
  const plants = useMemo(() => getPlantsForTrail(stateCode), [stateCode]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white min-h-[44px]"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="rounded-3xl border border-emerald-800/40 bg-gradient-to-br from-emerald-950/50 to-slate-950 p-5">
        <h2 className="text-xl font-bold text-white">Field guide</h2>
        <p className="text-sm text-slate-300 mt-1 leading-relaxed">
          Look at plants you might see outside with a grown-up. This guide does not save photos,
          location, or any personal information.
        </p>
        <p className="text-xs text-emerald-300/90 mt-2 font-semibold">
          {plants.length} plants to learn about
          {stateCode ? ` · trail near ${stateCode}` : ' · starter trail'}
        </p>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/70 border border-slate-700 rounded-2xl p-3">
        <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p>
          Look with your eyes only — do not pick plants or touch mushrooms. Always go with a
          grown-up.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {plants.map((plant) => (
          <button
            key={plant.id}
            type="button"
            onClick={() => setSelected(plant)}
            className="text-left rounded-2xl border border-slate-700 bg-slate-900/70 hover:border-emerald-600/50 p-3 transition"
          >
            <div className="text-3xl mb-2">{plant.emoji}</div>
            <div className="font-semibold text-sm text-slate-100">{plant.commonName}</div>
            <div
              className="text-[10px] mt-1 font-medium"
              style={{ color: getRarityColor(plant.rarity) }}
            >
              {getRarityLabel(plant.rarity)}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[110] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full sm:max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl max-h-[90dvh] overflow-y-auto p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selected.emoji}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{selected.commonName}</h3>
                  <p className="text-xs text-slate-400 italic">{selected.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-slate-400 text-2xl min-h-[44px] min-w-[44px]"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-slate-300">
              <span className="text-emerald-400 font-semibold">Look for: </span>
              {selected.lookFor}
            </p>
            <p className="text-sm text-slate-300">
              <span className="text-emerald-400 font-semibold">Habitat: </span>
              {selected.habitat}
            </p>
            <p className="text-sm text-slate-300">
              <span className="text-emerald-400 font-semibold">Fun fact: </span>
              {selected.funFact}
            </p>
            <p className="text-xs text-sky-200/90 bg-sky-950/40 border border-sky-800/40 rounded-xl p-3">
              {selected.safetyNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
