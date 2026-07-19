'use client';

import { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import type { RvListing } from '@/lib/rvListings';
import { formatRvPrice } from '@/lib/rvListings';
import {
  formatFeePercent,
  formatSellerPayout,
  quoteMarketplaceFee,
} from '@/lib/marketplaceFees';
import { MARKETPLACE_DISCLOSURE } from '@/lib/marketplaceDisclosure';
import { DEMO_NOTICE_SHORT } from '@/lib/demoMode';

interface MarketplaceCheckoutModalProps {
  listing: RvListing;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MarketplaceCheckoutModal({
  listing,
  onClose,
  onConfirm,
}: MarketplaceCheckoutModalProps) {
  const quote = quoteMarketplaceFee(listing.price);
  const [agreePrivate, setAgreePrivate] = useState(false);
  const [agreeFee, setAgreeFee] = useState(false);

  const canSubmit = agreePrivate && agreeFee;

  return (
    <div
      className="fixed inset-0 z-[130] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-900/95 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-lg">Buy through rvchain</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="font-semibold text-slate-100">{listing.title}</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{formatRvPrice(listing.price)}</div>
            <p className="text-[10px] text-slate-500 mt-1">{DEMO_NOTICE_SHORT}</p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Sale price</span>
              <span className="font-semibold">{formatRvPrice(quote.grossPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Marketplace fee</span>
              <span className="font-semibold text-slate-200">{formatFeePercent(quote.feePercent)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2">
              <span className="text-emerald-300 font-semibold">Seller receives</span>
              <span className="text-emerald-300 font-bold text-lg">
                {formatSellerPayout(quote.sellerNet)}
              </span>
            </div>
          </div>

          <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-500 leading-relaxed space-y-2">
            <p className="font-semibold text-slate-400">{MARKETPLACE_DISCLOSURE.title}</p>
            <p>{MARKETPLACE_DISCLOSURE.summary}</p>
            <ul className="list-disc pl-4 space-y-1">
              {MARKETPLACE_DISCLOSURE.bullets.slice(0, 5).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={agreePrivate}
              onChange={(e) => setAgreePrivate(e.target.checked)}
              className="mt-0.5 rounded border-slate-600"
            />
            <span>
              I understand this is a private-party vehicle sale; rvchain does not transfer title or
              guarantee the vehicle.
            </span>
          </label>
          <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeFee}
              onChange={(e) => setAgreeFee(e.target.checked)}
              className="mt-0.5 rounded border-slate-600"
            />
            <span>
              I agree to the marketplace fee of {formatFeePercent(quote.feePercent)} and the
              Marketplace Terms. Seller proceeds at this price:{' '}
              <strong className="text-emerald-300">{formatSellerPayout(quote.sellerNet)}</strong>.
            </span>
          </label>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={onConfirm}
            className="w-full h-12 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 font-semibold text-sm"
          >
            Complete purchase (demo)
          </button>
        </div>
      </div>
    </div>
  );
}
