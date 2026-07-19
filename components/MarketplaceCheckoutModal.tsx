'use client';

import { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import {
  formatFeePercent,
  formatSellerPayout,
  itemTypeLabel,
  quoteMarketplaceFee,
  type MarketplaceItemType,
} from '@/lib/marketplaceFees';
import { MARKETPLACE_DISCLOSURE } from '@/lib/marketplaceDisclosure';
import { DEMO_NOTICE_SHORT } from '@/lib/demoMode';

interface MarketplaceCheckoutModalProps {
  title: string;
  price: number;
  itemType: MarketplaceItemType;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MarketplaceCheckoutModal({
  title,
  price,
  itemType,
  onClose,
  onConfirm,
}: MarketplaceCheckoutModalProps) {
  const quote = quoteMarketplaceFee(price, itemType);
  const [agreePrivate, setAgreePrivate] = useState(false);
  const [agreeFee, setAgreeFee] = useState(false);
  const canSubmit = agreePrivate && agreeFee;

  const priceLabel = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);

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
            <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
              {itemTypeLabel(itemType)}
            </div>
            <div className="font-semibold text-slate-100">{title}</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{priceLabel}</div>
            <p className="text-[10px] text-slate-500 mt-1">{DEMO_NOTICE_SHORT}</p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Sale price</span>
              <span className="font-semibold">{priceLabel}</span>
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

          <div className="max-h-32 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-400 mb-1">{MARKETPLACE_DISCLOSURE.title}</p>
            <p>{MARKETPLACE_DISCLOSURE.summary}</p>
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={agreePrivate}
              onChange={(e) => setAgreePrivate(e.target.checked)}
              className="mt-0.5 rounded border-slate-600"
            />
            <span>
              I understand this is a private-party sale; rvchain does not transfer title or guarantee
              the item.
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
              I agree to the marketplace fee of {formatFeePercent(quote.feePercent)} and Terms. Seller
              proceeds: <strong className="text-emerald-300">{formatSellerPayout(quote.sellerNet)}</strong>.
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
