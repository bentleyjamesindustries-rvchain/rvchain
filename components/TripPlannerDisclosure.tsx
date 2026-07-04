'use client';

import { Info } from 'lucide-react';
import { TRIP_PLANNER_DISCLOSURE } from '@/lib/tripPlannerDisclosure';

export default function TripPlannerDisclosure() {
  return (
    <section
      className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-4 sm:p-5"
      aria-labelledby="trip-planner-disclosure-title"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-800/50 flex items-center justify-center shrink-0">
          <Info className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="trip-planner-disclosure-title" className="font-semibold text-slate-200 text-sm">
            {TRIP_PLANNER_DISCLOSURE.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{TRIP_PLANNER_DISCLOSURE.summary}</p>
          <ul className="mt-2 space-y-1.5 text-[11px] sm:text-xs text-slate-500 leading-relaxed list-disc pl-4">
            {TRIP_PLANNER_DISCLOSURE.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-[10px] text-slate-600 mt-3 border-t border-slate-800 pt-2">
            {TRIP_PLANNER_DISCLOSURE.footer}
          </p>
        </div>
      </div>
    </section>
  );
}