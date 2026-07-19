'use client';

import { useState } from 'react';
import { Baby, LogIn, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  signInExplorer,
  type ActiveExplorerSession,
} from '@/lib/familyExplorers';

interface ExplorerSignInModalProps {
  onClose: () => void;
  onSuccess: (session: ActiveExplorerSession) => void;
}

export default function ExplorerSignInModal({ onClose, onSuccess }: ExplorerSignInModalProps) {
  const [familyCode, setFamilyCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await signInExplorer(familyCode, nickname, pin);
    setSubmitting(false);
    if ('error' in result) {
      toast.error(result.error);
      return;
    }
    toast.success(`Welcome, ${result.session.nickname}! Happy trails.`);
    onSuccess(result.session);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="modal bg-slate-900 w-full sm:max-w-md sm:rounded-3xl border-t sm:border border-amber-800/40 rounded-t-3xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-900/40 flex items-center justify-center">
              <Baby className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-amber-50">Explorer sign-in</h2>
              <p className="text-[11px] text-slate-400">Kids only — ask a parent for your family code</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-xs text-slate-400">Family code</span>
            <input
              value={familyCode}
              onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
              placeholder="RV-XXXX"
              autoComplete="off"
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 h-11 text-sm font-mono tracking-wider"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Your nickname</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Scout"
              autoComplete="username"
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 h-11 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">PIN</span>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••"
              maxLength={6}
              autoComplete="current-password"
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 h-11 text-sm tracking-widest"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {submitting ? 'Checking…' : 'Start exploring'}
          </button>
        </form>
      </div>
    </div>
  );
}
