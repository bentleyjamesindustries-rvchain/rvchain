'use client';

import { useState } from 'react';
import { ChecklistPack, countPackItems, countPackEssentials } from '@/lib/tripChecklists';

interface CampingChecklistProps {
  pack: ChecklistPack;
  checkedIds: string[];
  onToggle: (itemId: string) => void;
  readOnly?: boolean;
}

export default function CampingChecklist({
  pack,
  checkedIds,
  onToggle,
  readOnly = false,
}: CampingChecklistProps) {
  const [essentialsOnly, setEssentialsOnly] = useState(false);
  const total = countPackItems(pack);
  const essentials = countPackEssentials(pack);
  const done = checkedIds.filter((id) =>
    pack.sections.some((s) => s.items.some((i) => i.id === id))
  ).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-4 print:text-black">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-sm flex items-center gap-2">
            <span>{pack.icon}</span>
            {pack.title}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{pack.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={essentialsOnly}
              onChange={(e) => setEssentialsOnly(e.target.checked)}
              className="rounded border-slate-600"
            />
            Essentials only ({essentials})
          </label>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-emerald-300">{pct}%</div>
            <div className="text-[10px] text-slate-500">
              {done}/{total}
            </div>
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {pack.sections.map((section) => {
        const items = essentialsOnly
          ? section.items.filter((i) => i.required)
          : section.items;
        if (items.length === 0) return null;
        return (
          <div key={section.id}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-slate-900/95 py-1 backdrop-blur z-[1]">
              {section.title}
            </div>
            <ul className="space-y-1.5">
              {items.map((item) => {
                const checked = checkedIds.includes(item.id);
                return (
                  <li key={item.id}>
                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition ${
                        checked
                          ? 'border-emerald-800/50 bg-emerald-950/25'
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-600'
                      } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={readOnly}
                        onChange={() => onToggle(item.id)}
                        className="mt-0.5 rounded border-slate-600"
                      />
                      <span className="flex-1 min-w-0">
                        <span
                          className={`text-sm ${checked ? 'text-slate-400 line-through' : 'text-slate-200'}`}
                        >
                          {item.label}
                          {item.required && (
                            <span className="text-[10px] text-amber-400/80 ml-1">(essential)</span>
                          )}
                        </span>
                        {item.tip && (
                          <span className="block text-[11px] text-slate-500 mt-0.5">{item.tip}</span>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
