'use client';

import { Info } from 'lucide-react';
import { DEMO_NOTICE_SHORT } from '@/lib/demoMode';

export default function DemoBanner() {
  return (
    <div
      role="status"
      className="sticky top-0 z-40 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-2 text-center text-[11px] sm:text-xs font-medium text-amber-950 bg-amber-400/95 border-b border-amber-500/60 shadow-sm"
    >
      <span className="inline-flex items-center gap-2">
        <Info className="w-3.5 h-3.5 shrink-0" aria-hidden />
        <span>{DEMO_NOTICE_SHORT}</span>
      </span>
      <span className="hidden sm:inline text-amber-900/80">·</span>
      <span className="text-amber-900/90 font-normal">
        Sample names &amp; listings are fictional · no third-party brands
      </span>
    </div>
  );
}