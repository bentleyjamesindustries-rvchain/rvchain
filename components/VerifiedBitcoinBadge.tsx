'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, X, Shield } from 'lucide-react';

export interface VerificationInfo {
  hash: string;
  verifiedAt: string;
  verifiedBy?: string;
  proofUrl: string;
  otsAvailable?: boolean;
}

interface VerifiedBitcoinBadgeProps {
  verification: VerificationInfo;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { img: 48, label: 'text-[9px]' },
  md: { img: 72, label: 'text-[10px]' },
  lg: { img: 120, label: 'text-xs' },
};

export default function VerifiedBitcoinBadge({
  verification,
  size = 'md',
  className = '',
}: VerifiedBitcoinBadgeProps) {
  const [open, setOpen] = useState(false);
  const s = SIZES[size];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group inline-flex flex-col items-center gap-1 rounded-xl transition hover:scale-[1.02] active:scale-[0.98] ${className}`}
        title="Verified on Bitcoin — view proof"
      >
        <Image
          src="/verified-bitcoin-badge.png"
          alt="Verified on Bitcoin"
          width={s.img}
          height={s.img}
          className="rounded-lg shadow-lg shadow-orange-500/20 ring-1 ring-orange-500/30 group-hover:ring-cyan-400/50 transition"
        />
        <span className={`font-semibold text-orange-300/90 ${s.label} tracking-wide`}>
          Verified on Bitcoin
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[130] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="modal bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-orange-300 font-semibold">
                <Shield className="w-5 h-5" />
                Bitcoin Verification Proof
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <Image
                src="/verified-bitcoin-badge.png"
                alt="Verified on Bitcoin"
                width={140}
                height={140}
                className="rounded-xl shadow-xl shadow-orange-500/25"
              />
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Verified on</div>
                <div className="font-medium">
                  {new Date(verification.verifiedAt).toLocaleString()}
                </div>
              </div>
              {verification.verifiedBy && (
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Verified by</div>
                  <div className="font-medium">{verification.verifiedBy}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-slate-400 mb-0.5">SHA256 hash</div>
                <div className="font-mono text-[10px] break-all text-cyan-300/90 bg-slate-950 p-2 rounded-xl">
                  {verification.hash}
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                This spot&apos;s data was hashed and timestamped via{' '}
                <strong className="text-slate-300">OpenTimestamps</strong> on the Bitcoin blockchain
                — a permanent public proof of verification.
              </p>
            </div>

            <a
              href={verification.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-600 h-11 rounded-2xl font-semibold text-sm transition"
            >
              <ExternalLink className="w-4 h-4" />
              View OpenTimestamps Proof
            </a>
          </div>
        </div>
      )}
    </>
  );
}