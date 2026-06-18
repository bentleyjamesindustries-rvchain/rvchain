'use client';

import { useState } from 'react';
import { Wallet, Gift, Bitcoin, ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react';

interface WalletInviteModalProps {
  onSetUp: () => void;
  onSkip: () => void;
  onClose?: () => void;
}

export default function WalletInviteModal({ onSetUp, onSkip, onClose }: WalletInviteModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[115] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose ?? onSkip}
    >
      <div
        className="modal bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700 p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Welcome to rvchain!</h3>
              <p className="text-sm text-slate-400">Your account is ready.</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-5">
          <p className="text-sm text-slate-200 leading-relaxed">
            Would you like to add a <strong className="text-amber-300">Bitcoin wallet</strong> to your profile?
            It&apos;s completely optional — you can always set one up later.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <Gift className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>Receive and redeem camping rewards tied to your account</span>
            </li>
            <li className="flex items-start gap-2">
              <Bitcoin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span>Accept Bitcoin payouts when hosts or partners send them</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>You stay in control — we only save your public receive address</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onSetUp}
            className="w-full bg-amber-600 hover:bg-amber-500 h-11 rounded-2xl font-semibold text-sm transition"
          >
            Set Up Wallet
          </button>
          <button
            onClick={onSkip}
            className="w-full border border-slate-600 hover:bg-slate-800 h-11 rounded-2xl text-sm text-slate-300 transition"
          >
            Maybe Later
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="mt-4 w-full flex items-center justify-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition"
        >
          {showDetails ? (
            <>
              Hide wallet options &amp; how it works
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              What wallet options are available?
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {showDetails && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-3 leading-relaxed">
            <div>
              <div className="font-semibold text-slate-300 mb-1">Create a new wallet</div>
              <p>
                Generate a non-custodial Bitcoin wallet right in your browser. You&apos;ll get a seed phrase
                to back up — RV Chain stores only your public receive address, never your private keys.
              </p>
            </div>
            <div>
              <div className="font-semibold text-slate-300 mb-1">Connect an existing wallet</div>
              <p>
                Already use Coinbase Wallet, BlueWallet, or another app? Paste your Bitcoin receive address
                or scan its QR code. No need to move funds or create anything new.
              </p>
            </div>
            <div>
              <div className="font-semibold text-slate-300 mb-1">How you&apos;ll use it on rvchain</div>
              <p>
                Your wallet links to your profile for reward redemptions, future Bitcoin features, and
                verified campsite proofs. Bookings, favorites, and trips work the same with or without a wallet.
              </p>
            </div>
            <p className="text-slate-500 pt-1 border-t border-slate-800">
              You can open <strong className="text-slate-400">My Wallet</strong> anytime from the header or your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}