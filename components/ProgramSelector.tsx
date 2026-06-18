'use client';

import { Navigation, CalendarCheck, Check } from 'lucide-react';
import { REWARD_PROGRAMS, RewardProgramId } from '@/lib/rewardPrograms';

const ICONS = {
  mileage: Navigation,
  booking: CalendarCheck,
} as const;

interface ProgramSelectorProps {
  active: RewardProgramId;
  onSelect: (id: RewardProgramId) => void;
  compact?: boolean;
}

export default function ProgramSelector({ active, onSelect, compact }: ProgramSelectorProps) {
  return (
    <div className={`grid grid-cols-1 ${compact ? '' : 'sm:grid-cols-2'} gap-3`}>
      {REWARD_PROGRAMS.map((program) => {
        const Icon = ICONS[program.id];
        const selected = active === program.id;
        return (
          <button
            key={program.id}
            type="button"
            onClick={() => onSelect(program.id)}
            className={`text-left p-4 rounded-2xl border-2 transition ${
              selected
                ? `${program.borderAccent} bg-slate-900`
                : 'border-slate-800 bg-slate-950/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                program.id === 'mileage' ? 'bg-emerald-900/40' : 'bg-sky-900/40'
              }`}>
                <Icon className={`w-5 h-5 ${program.accent}`} />
              </div>
              {selected && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Active
                </span>
              )}
            </div>
            <div className="font-semibold mt-2">{program.name}</div>
            <div className={`text-xs font-medium ${program.accent}`}>{program.tagline}</div>
            {!compact && (
              <>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{program.description}</p>
                <ul className="mt-2 space-y-0.5">
                  {program.highlights.map((h) => (
                    <li key={h} className="text-[10px] text-slate-500">• {h}</li>
                  ))}
                </ul>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}