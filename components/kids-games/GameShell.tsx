'use client';

import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface GameShellProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function GameShell({ title, subtitle, onBack, children, footer }: GameShellProps) {
  return (
    <div className="kids-game space-y-3 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Games
        </button>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-white truncate">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="kids-game-stage rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl shadow-black/40">
        {children}
      </div>
      {footer}
    </div>
  );
}
