'use client';

import { Info } from 'lucide-react';
import { DEMO_NOTICE_SHORT } from '@/lib/demoMode';

export default function DemoBanner() {
  return (
    <div
      role="status"
      className="sticky top-0 z-40 flex items-center justify-center gap-2 px-3 py-2 text-center text-[11px] sm:text-xs font-medium text-amber-950 bg-amber-400/95 border-b border-amber-500/60 shadow-sm"
    >
      <Info className="w-3.5 h-3.5 shrink-0" aria-hidden />
      <span>{DEMO_NOTICE_SHORT}</span>
    </div>
  );
}