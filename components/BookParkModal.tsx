'use client';

import { useState } from 'react';
import { X, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Park } from '@/lib/parks';
import { DEMO_NOTICE } from '@/lib/demoMode';

interface BookParkModalProps {
  park: Park;
  onClose: () => void;
  onConfirm: (checkIn: string, checkOut: string) => void;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function BookParkModal({ park, onClose, onConfirm }: BookParkModalProps) {
  const [checkIn, setCheckIn] = useState(todayStr());
  const [checkOut, setCheckOut] = useState(addDays(todayStr(), 2));

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
  );
  const totalUsd = (park.price ?? 0) * nights;
  const valid = checkOut > checkIn;

  const handleConfirm = () => {
    if (!valid) return;
    onConfirm(checkIn, checkOut);
    toast.success('Demo booking saved locally — no payment or reservation was made.');
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="modal bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700 p-5 sm:p-6 max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 p-3 rounded-2xl border border-amber-600/40 bg-amber-950/30 text-[11px] text-amber-200/90 leading-relaxed">
          {DEMO_NOTICE}
        </div>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-xl">Book at {park.name}</h3>
            <p className="text-sm text-slate-400">{park.city}, {park.state}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-slate-400 mb-1 block">Check-in</span>
              <input
                type="date"
                value={checkIn}
                min={todayStr()}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-2xl px-3 h-11"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-400 mb-1 block">Check-out</span>
              <input
                type="date"
                value={checkOut}
                min={addDays(checkIn, 1)}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-2xl px-3 h-11"
              />
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{nights} night{nights !== 1 ? 's' : ''} × ${park.price}/night</span>
              <span className="font-semibold text-white">${totalUsd.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Demo only — estimated total for planning, not a real charge.</p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!valid}
          className="mt-6 w-full h-12 rounded-3xl bg-sky-700 hover:bg-sky-600 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
        >
          <CalendarCheck className="w-4 h-4" />
          Save demo booking
        </button>
      </div>
    </div>
  );
}