'use client';

import { useState } from 'react';
import { X, CalendarCheck, CreditCard, Coins, Copy, Check, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Park } from '@/lib/parks';
import {
  PaymentMethod,
  UsdcChainId,
  USDC_CHAINS,
  usdToUsdc,
  getUsdcChain,
  BookingPayment,
} from '@/lib/usdcPayments';

interface BookParkModalProps {
  park: Park;
  onClose: () => void;
  onConfirm: (checkIn: string, checkOut: string, payment: BookingPayment) => void;
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('demo');
  const [usdcChain, setUsdcChain] = useState<UsdcChainId>('base');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
  );
  const totalUsd = (park.price ?? 0) * nights;
  const totalUsdc = usdToUsdc(totalUsd);
  const chain = getUsdcChain(usdcChain);
  const valid = checkOut > checkIn;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(chain.receiveAddress);
    setCopied(true);
    toast.success('USDC address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    if (!valid) return;

    if (paymentMethod === 'usdc') {
      setPaying(true);
      // MVP: simulate wallet confirmation after user sends USDC
      await new Promise((r) => setTimeout(r, 800));
      const payment: BookingPayment = {
        method: 'usdc',
        usdcChain,
        usdcAmount: totalUsdc,
        usdAmount: totalUsd,
        txHash: txHash.trim() || `demo-usdc-${Date.now()}`,
        paidAt: new Date().toISOString(),
      };
      onConfirm(checkIn, checkOut, payment);
      setPaying(false);
      toast.success(`Booking confirmed! ${totalUsdc} USDC on ${chain.label}`);
      return;
    }

    onConfirm(checkIn, checkOut, {
      method: paymentMethod,
      usdcAmount: 0,
      usdAmount: totalUsd,
      paidAt: new Date().toISOString(),
    });
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
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-sm font-medium mb-1">
              <CalendarCheck className="w-4 h-4" />
              Book on rvchain
            </div>
            <h3 className="font-semibold text-xl pr-4">{park.name}</h3>
            <p className="text-sm text-emerald-300">{park.city}, {park.state}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-white">×</button>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Check-in date</label>
            <input
              type="date"
              value={checkIn}
              min={todayStr()}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-sky-600"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Check-out date</label>
            <input
              type="date"
              value={checkOut}
              min={addDays(checkIn, 1)}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-4 h-11 rounded-2xl text-sm outline-none focus:border-sky-600"
            />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">{nights} night{nights > 1 ? 's' : ''} × ${park.price}/night</span>
            <span className="font-semibold">${totalUsd}</span>
          </div>
          {paymentMethod === 'usdc' && (
            <div className="flex justify-between mt-2 pt-2 border-t border-slate-800 text-sky-300">
              <span>USDC total (1:1)</span>
              <span className="font-bold">{totalUsdc} USDC</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Payment method</div>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('demo')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition ${
                paymentMethod === 'demo' ? 'border-sky-600 bg-sky-950/40' : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <CalendarCheck className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm">Demo booking</div>
                <div className="text-[10px] text-slate-400">No charge — earn rewards on check-in</div>
              </div>
            </button>

            <button
              type="button"
              disabled
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-800 opacity-50 text-left cursor-not-allowed"
            >
              <CreditCard className="w-5 h-5 text-slate-500 shrink-0" />
              <div>
                <div className="font-semibold text-sm">Card / Fiat</div>
                <div className="text-[10px] text-slate-500">Coming soon</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('usdc')}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition ${
                paymentMethod === 'usdc' ? 'border-emerald-600 bg-emerald-950/30' : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <Coins className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm">Pay with USDC</div>
                <div className="text-[10px] text-slate-400">
                  ${totalUsd} = {totalUsdc} USDC · Low-fee chains
                </div>
              </div>
            </button>
          </div>
        </div>

        {paymentMethod === 'usdc' && (
          <div className="mb-4 p-4 rounded-2xl border border-emerald-800/50 bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <Wallet className="w-4 h-4" />
              USDC checkout
            </div>

            <div className="flex gap-2">
              {USDC_CHAINS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setUsdcChain(c.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                    usdcChain === c.id
                      ? 'border-emerald-600 bg-emerald-900/40 text-emerald-200'
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="text-[10px] text-slate-400">
              Network fee: {chain.estimatedFee} · Send exactly{' '}
              <strong className="text-emerald-300">{totalUsdc} USDC</strong>
            </div>

            <div className="bg-slate-950 rounded-xl p-3">
              <div className="text-[10px] text-slate-500 mb-1">Send USDC to</div>
              <div className="flex items-center gap-2">
                <code className="text-[10px] font-mono text-slate-300 break-all flex-1">
                  {chain.receiveAddress}
                </code>
                <button type="button" onClick={copyAddress} className="shrink-0 p-2 rounded-lg bg-slate-800">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Transaction hash (optional for demo)"
              className="w-full bg-slate-950 border border-slate-700 px-3 h-10 rounded-xl text-xs font-mono outline-none focus:border-emerald-600"
            />

            <p className="text-[10px] text-slate-500 leading-relaxed">
              MVP mode: tap confirm after sending USDC from your wallet (Coinbase Wallet, MetaMask, Phantom, etc.).
              Booking auto-confirms for host and guest.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-slate-600 h-11 rounded-2xl text-sm">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!valid || paying}
            className="flex-1 bg-sky-700 hover:bg-sky-600 disabled:opacity-40 h-11 rounded-2xl font-semibold text-sm transition"
          >
            {paying ? 'Confirming...' : paymentMethod === 'usdc' ? `Pay ${totalUsdc} USDC` : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}