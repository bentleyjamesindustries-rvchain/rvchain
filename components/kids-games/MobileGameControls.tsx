'use client';

import type { ReactNode } from 'react';

/** Large touch-friendly control bar for kids games on phones */
export function MobileControlBar({ children }: { children: ReactNode }) {
  return (
    <div className="kids-game-controls flex gap-2 p-3 bg-slate-900/95 border-t border-slate-700">
      {children}
    </div>
  );
}

interface HoldButtonProps {
  label: string;
  sub?: string;
  className?: string;
  onHoldStart: () => void;
  onHoldEnd: () => void;
}

/** Hold-to-move / tap-safe control — uses pointer events (works on iOS Safari) */
export function HoldButton({ label, sub, className = '', onHoldStart, onHoldEnd }: HoldButtonProps) {
  return (
    <button
      type="button"
      className={`kids-game-btn flex-1 min-h-[56px] rounded-2xl font-black text-base select-none touch-none active:scale-[0.97] transition ${className}`}
      style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        onHoldStart();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        onHoldEnd();
      }}
      onPointerCancel={() => onHoldEnd()}
      onPointerLeave={(e) => {
        // Only end if we still own the pointer
        if (e.buttons === 0) onHoldEnd();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="block leading-tight">{label}</span>
      {sub && <span className="block text-[10px] font-semibold opacity-80 mt-0.5">{sub}</span>}
    </button>
  );
}

interface TapButtonProps {
  label: string;
  sub?: string;
  className?: string;
  onTap: () => void;
}

export function TapButton({ label, sub, className = '', onTap }: TapButtonProps) {
  return (
    <button
      type="button"
      className={`kids-game-btn flex-1 min-h-[56px] rounded-2xl font-black text-base select-none touch-none active:scale-[0.97] transition ${className}`}
      style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onTap();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="block leading-tight">{label}</span>
      {sub && <span className="block text-[10px] font-semibold opacity-80 mt-0.5">{sub}</span>}
    </button>
  );
}
