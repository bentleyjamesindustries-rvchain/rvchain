'use client';

import { Check, Lock } from 'lucide-react';
import {
  CHECKLIST_PACKS,
  getPackPreviewMeta,
  type ChecklistPackId,
} from '@/lib/tripChecklists';

interface ChecklistPackPickerProps {
  availablePackIds: ChecklistPackId[];
  selectedPackIds: ChecklistPackId[];
  maxSelectable: number;
  onToggle: (packId: ChecklistPackId) => void;
  /** Show all packs locked for free-tier preview */
  previewAllLocked?: boolean;
}

export default function ChecklistPackPicker({
  availablePackIds,
  selectedPackIds,
  maxSelectable,
  onToggle,
  previewAllLocked = false,
}: ChecklistPackPickerProps) {
  const packs = previewAllLocked
    ? CHECKLIST_PACKS
    : CHECKLIST_PACKS.filter((p) => availablePackIds.includes(p.id));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-semibold text-sm text-slate-200">Choose checklist pack{maxSelectable > 1 ? 's' : ''}</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {previewAllLocked
              ? 'Upgrade to unlock these packing lists for your trip.'
              : maxSelectable === 1
                ? 'Tap one card to add that packing list, then check items off below.'
                : `Tap cards to add packing lists (up to ${maxSelectable === 6 ? 'all' : maxSelectable}). Check items off below.`}
          </p>
        </div>
        {!previewAllLocked && (
          <span className="text-[11px] text-slate-500">
            {selectedPackIds.length}/{maxSelectable === 6 ? '∞' : maxSelectable} selected
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {packs.map((pack) => {
          const meta = getPackPreviewMeta(pack);
          const selected = selectedPackIds.includes(pack.id);
          const locked = previewAllLocked || !availablePackIds.includes(pack.id);
          const atCap =
            !selected &&
            !locked &&
            maxSelectable < 6 &&
            selectedPackIds.length >= maxSelectable;

          return (
            <button
              key={pack.id}
              type="button"
              disabled={locked || atCap}
              onClick={() => onToggle(pack.id)}
              className={`text-left rounded-2xl border p-4 transition relative ${
                selected
                  ? 'border-emerald-500 bg-emerald-950/40 shadow-md shadow-emerald-900/20'
                  : locked
                    ? 'border-slate-800 bg-slate-950/40 opacity-70'
                    : atCap
                      ? 'border-slate-800 bg-slate-950/40 opacity-50 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-950/60 hover:border-amber-600/50'
              }`}
            >
              {selected && (
                <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </span>
              )}
              {locked && (
                <span className="absolute top-3 right-3 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
              )}
              <div className="text-2xl mb-2">{pack.icon}</div>
              <div className="font-semibold text-slate-100 pr-8">{pack.title}</div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pack.description}</p>
              <div className="flex flex-wrap gap-2 mt-3 text-[10px] text-slate-500">
                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                  {meta.itemCount} items
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                  {meta.essentialCount} essentials
                </span>
                {pack.durationHint && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                    {pack.durationHint}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
