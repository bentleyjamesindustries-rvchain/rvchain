'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, X, ShieldCheck } from 'lucide-react';
import type { RvCertificationDisplay } from '@/lib/rvCertification';

interface RvchainCertifiedBadgeProps {
  certification: RvCertificationDisplay;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { img: 40, label: 'text-[9px]', pad: 'px-2 py-1' },
  md: { img: 52, label: 'text-[10px]', pad: 'px-2.5 py-1.5' },
  lg: { img: 72, label: 'text-xs', pad: 'px-3 py-2' },
};

export default function RvchainCertifiedBadge({
  certification,
  size = 'md',
  className = '',
}: RvchainCertifiedBadgeProps) {
  const [open, setOpen] = useState(false);
  const s = SIZES[size];

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`group inline-flex items-center gap-2 rounded-xl border border-emerald-600/50 bg-emerald-950/50 backdrop-blur transition hover:scale-[1.02] active:scale-[0.98] hover:border-emerald-500/70 ${s.pad} ${className}`}
        title="RVCHAIN Certified — view blockchain proof"
      >
        <Image
          src="/rvchain-logo.jpg"
          alt="RVCHAIN Certified"
          width={s.img}
          height={s.img}
          className="rounded-lg ring-1 ring-emerald-500/40 group-hover:ring-emerald-400/60 transition shrink-0"
        />
        <span className={`font-bold text-emerald-300 ${s.label} tracking-wide text-left leading-tight`}>
          RVCHAIN
          <span className="block text-emerald-400/90 font-semibold">Certified</span>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[130] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="modal bg-slate-900 border border-emerald-800/50 rounded-3xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <ShieldCheck className="w-5 h-5" />
                RVCHAIN Certification
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <Image
                src="/rvchain-logo.jpg"
                alt="RVCHAIN Certified"
                width={120}
                height={120}
                className="rounded-2xl shadow-xl shadow-emerald-900/30 ring-2 ring-emerald-600/40"
              />
            </div>

            <p className="text-sm text-slate-300 text-center mb-5 leading-relaxed">
              This listing is backed by an official <strong className="text-emerald-300">RVCHAIN Seller Certification</strong>,
              recorded on the Bitcoin blockchain via OpenTimestamps.
            </p>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Certified on</div>
                <div className="font-medium">
                  {new Date(certification.certifiedAt).toLocaleString()}
                </div>
              </div>
              {certification.certifiedBy && (
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">Issued by</div>
                  <div className="font-medium">{certification.certifiedBy}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-slate-400 mb-0.5">SHA256 hash</div>
                <div className="font-mono text-[10px] break-all text-emerald-300/90 bg-slate-950 p-2 rounded-xl">
                  {certification.hash}
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Subscribed RVCHAIN sellers receive this certification when their listing is verified.
                The hash is permanently anchored on Bitcoin through OpenTimestamps.
              </p>
            </div>

            <a
              href={certification.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 h-11 rounded-2xl font-semibold text-sm transition"
            >
              <ExternalLink className="w-4 h-4" />
              View Blockchain Proof
            </a>
          </div>
        </div>
      )}
    </>
  );
}