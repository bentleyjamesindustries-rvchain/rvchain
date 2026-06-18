'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wallet, Plus, Link2, Copy, Check, X,
  Shield, Trash2, ScanLine,
} from 'lucide-react';
import { toast } from 'sonner';
import QrScannerModal from './QrScannerModal';
import AddressValidationFeedback from './AddressValidationFeedback';
import { createNewBitcoinWallet } from '@/lib/createBitcoinWallet';
import {
  isValidBitcoinAddress,
  truncateAddress,
  getAddressValidationState,
  normalizeBitcoinAddress,
  extractBitcoinAddressFromQr,
} from '@/lib/bitcoinAddress';
import {
  WalletProfile,
  loadWalletProfile,
  saveWalletProfile,
  disconnectWallet,
} from '@/lib/walletStorage';

type Step = 'choose' | 'create' | 'manual' | 'connected';

interface WalletOnboardingProps {
  userId?: string | null;
  onComplete?: (profile: WalletProfile) => void;
  onClose?: () => void;
  onRequestSignIn?: () => void;
  embedded?: boolean;
}

export default function WalletOnboarding({
  userId,
  onComplete,
  onClose,
  onRequestSignIn,
  embedded = false,
}: WalletOnboardingProps) {
  const isSignedIn = Boolean(userId);
  const [step, setStep] = useState<Step>('choose');
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [wallet, setWallet] = useState<WalletProfile | null>(() =>
    userId ? loadWalletProfile(userId) : null
  );
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [seedConfirmed, setSeedConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  const manualValidation = useMemo(
    () => getAddressValidationState(manualAddress),
    [manualAddress]
  );
  const isManualAddressValid = manualValidation === 'valid';

  useEffect(() => {
    if (!userId) {
      setWallet(null);
      setStep('choose');
      setMnemonic(null);
      setManualAddress('');
      return;
    }
    const existing = loadWalletProfile(userId);
    if (existing) {
      setWallet(existing);
      setStep('connected');
    } else {
      setWallet(null);
      setStep('choose');
    }
  }, [userId]);

  const requireSignedIn = useCallback(
    (action: string) => {
      if (isSignedIn && userId) return true;
      toast.error(`Sign in to ${action}.`);
      onRequestSignIn?.();
      return false;
    },
    [isSignedIn, userId, onRequestSignIn]
  );

  const persistWallet = useCallback(
    (profile: WalletProfile) => {
      if (!userId) return;
      saveWalletProfile(userId, profile);
      setWallet(profile);
      setStep('connected');
      onComplete?.(profile);
    },
    [userId, onComplete]
  );

  const handleCreateWallet = () => {
    if (!requireSignedIn('create a wallet')) return;
    try {
      const generated = createNewBitcoinWallet();
      setMnemonic(generated.mnemonic);
      setNewAddress(generated.address);
      setStep('create');
      setSeedConfirmed(false);
    } catch {
      toast.error('Could not generate wallet. Please try again.');
    }
  };

  const handleConfirmNewWallet = () => {
    if (!requireSignedIn('create a wallet')) return;
    if (!seedConfirmed) return toast.error('Please confirm you have backed up your seed phrase.');
    if (!newAddress) return;

    persistWallet({
      bitcoinAddress: newAddress,
      source: 'created',
      connectedAt: new Date().toISOString(),
    });
    setMnemonic(null);
    toast.success(`Wallet created! Address: ${truncateAddress(newAddress)}`);
  };

  const handleStartManualConnect = () => {
    if (!requireSignedIn('connect a wallet')) return;
    setStep('manual');
  };

  const handleManualConnect = () => {
    if (!requireSignedIn('connect a wallet')) return;
    const addr = normalizeBitcoinAddress(manualAddress);
    if (!isValidBitcoinAddress(addr)) {
      return toast.error('Enter a valid Bitcoin address before saving.');
    }
    persistWallet({
      bitcoinAddress: addr,
      source: 'manual',
      connectedAt: new Date().toISOString(),
    });
    toast.success(`Address saved: ${truncateAddress(addr)}`);
  };

  const handleQrScan = useCallback((raw: string) => {
    if (!isSignedIn) {
      toast.error('Sign in to connect a wallet.');
      onRequestSignIn?.();
      return;
    }
    const extracted = extractBitcoinAddressFromQr(raw);
    setManualAddress(extracted);
    setShowQrScanner(false);

    if (isValidBitcoinAddress(extracted)) {
      toast.success('QR scanned — valid Bitcoin address detected!');
    } else {
      toast.error('QR scanned but address is invalid. Check the code or enter manually.');
    }
  }, [isSignedIn, onRequestSignIn]);

  const handleDisconnect = () => {
    if (!userId) return;
    disconnectWallet(userId);
    setWallet(null);
    setMnemonic(null);
    setManualAddress('');
    setStep('choose');
    toast.success('Wallet disconnected.');
  };

  const copyMnemonic = async () => {
    if (!mnemonic) return;
    await navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    toast.success('Seed phrase copied. Store it offline and delete from clipboard.');
    setTimeout(() => setCopied(false), 3000);
  };

  const shellClass = embedded
    ? 'space-y-5'
    : 'bg-slate-900 border-0 sm:border border-slate-700 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 max-w-2xl w-full max-h-[92dvh] overflow-y-auto';

  return (
    <div className={shellClass}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-semibold">My Wallet</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!isSignedIn && (
        <div className="space-y-4 mt-2 p-5 rounded-2xl border border-slate-700 bg-slate-950/80">
          <p className="text-sm text-slate-300 leading-relaxed">
            Sign in to create or connect a Bitcoin wallet tied to your rvchain account.
          </p>
          <p className="text-xs text-slate-500">
            Wallets are not saved for guest sessions — your address syncs with your profile after sign-in.
          </p>
          {onRequestSignIn && (
            <button
              type="button"
              onClick={onRequestSignIn}
              className="w-full bg-sky-700 hover:bg-sky-600 h-11 rounded-2xl font-semibold text-sm transition"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {isSignedIn && step === 'connected' && wallet && (
        <div className="space-y-4">
          <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-2">
              <Check className="w-4 h-4" />
              Wallet Connected
            </div>
            <div className="font-mono text-sm break-all text-emerald-100">{wallet.bitcoinAddress}</div>
            <div className="text-xs text-slate-400 mt-2 capitalize">
              Source: {wallet.source === 'created' ? 'New wallet (non-custodial)' : 'Manual entry'}
              {' · '}
              Connected {new Date(wallet.connectedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep('choose')}
              className="flex-1 text-sm border border-slate-600 hover:bg-slate-800 h-10 rounded-2xl transition"
            >
              Change Wallet
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 text-sm text-red-300 hover:text-red-200 border border-red-900/50 hover:bg-red-950/30 px-4 h-10 rounded-2xl transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        </div>
      )}

      {isSignedIn && step !== 'connected' && (
        <>
          {step === 'choose' && (
            <div className="space-y-3 mt-4">
              <p className="text-sm text-slate-400">Choose how you want to attach a Bitcoin address:</p>

              <button
                type="button"
                onClick={handleCreateWallet}
                className={`w-full text-left p-4 rounded-2xl border-2 transition group ${
                  isSignedIn
                    ? 'border-emerald-700/60 bg-emerald-950/30 hover:bg-emerald-950/50'
                    : 'border-slate-700 bg-slate-950/80 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSignedIn ? 'bg-emerald-800/50' : 'bg-slate-800'
                  }`}>
                    <Plus className={`w-5 h-5 ${isSignedIn ? 'text-emerald-300' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2 flex-wrap">
                      Create a New Wallet
                      {isSignedIn ? (
                        <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full">Recommended</span>
                      ) : (
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">Sign in required</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {isSignedIn
                        ? 'Generate a non-custodial wallet in your browser. You get a seed phrase — we only save your public address.'
                        : 'Create an account first so your wallet is tied to your profile — not a guest session on this device.'}
                    </p>
                    {!isSignedIn && onRequestSignIn && (
                      <span className="inline-block mt-2 text-xs font-semibold text-sky-400 group-hover:text-sky-300">
                        Sign in to continue →
                      </span>
                    )}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleStartManualConnect}
                className="w-full text-left p-4 rounded-2xl border border-slate-700 bg-slate-950 hover:border-slate-500 transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5 text-sky-300" />
                  </div>
                  <div>
                    <div className="font-semibold">Connect Existing Wallet</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Paste your Bitcoin receive address from any wallet app you already use.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowWalletDetails((v) => !v)}
                className="w-full text-xs text-sky-400 hover:text-sky-300 pt-1 transition"
              >
                {showWalletDetails ? 'Hide details' : 'Learn more about wallet options & security'}
              </button>

              {showWalletDetails && (
                <div className="text-xs text-slate-400 space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
                  <p>
                    <strong className="text-slate-300">Create:</strong> generates a wallet in your browser.
                    Back up your seed phrase offline — we only save your public address.
                  </p>
                  <p>
                    <strong className="text-slate-300">Connect:</strong> paste or scan an address from any
                    wallet app you already use (Coinbase Wallet, BlueWallet, etc.).
                  </p>
                  <p className="text-slate-500">
                    RV Chain never holds your funds or private keys. You can disconnect or change your
                    address anytime.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'create' && mnemonic && (
            <div className="space-y-4 mt-4">
              <div className="bg-red-950/30 border border-red-800/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-red-300 font-semibold text-sm mb-2">
                  <Shield className="w-4 h-4" />
                  Write down your seed phrase — shown once
                </div>
                <p className="text-xs text-red-200/80 mb-3">
                  RV Chain never stores your seed phrase. If you lose it, your funds cannot be recovered.
                </p>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {mnemonic.split(' ').map((word, i) => (
                    <div key={i} className="text-slate-300">
                      <span className="text-slate-500 mr-1">{i + 1}.</span>{word}
                    </div>
                  ))}
                </div>
                <button
                  onClick={copyMnemonic}
                  className="mt-3 flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy seed phrase'}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs text-slate-400 mb-1">Your Bitcoin receive address</div>
                <div className="font-mono text-sm text-emerald-300 break-all">{newAddress}</div>
              </div>

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={seedConfirmed}
                  onChange={(e) => setSeedConfirmed(e.target.checked)}
                  className="mt-1 rounded"
                />
                <span className="text-slate-300">
                  I have written down my seed phrase and stored it safely offline.
                </span>
              </label>

              <div className="flex gap-2">
                <button onClick={() => setStep('choose')} className="flex-1 border border-slate-600 h-11 rounded-2xl text-sm">
                  Back
                </button>
                <button
                  onClick={handleConfirmNewWallet}
                  disabled={!seedConfirmed}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 h-11 rounded-2xl font-semibold text-sm transition"
                >
                  Save Address &amp; Finish
                </button>
              </div>
            </div>
          )}

          {step === 'manual' && (
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Connect Existing Wallet</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Paste your receive address or scan the QR code from your wallet app.
                </p>

                <label className="text-sm text-slate-400 mb-2 block">Bitcoin receive address</label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="bc1q... or 1... or 3..."
                  autoComplete="off"
                  spellCheck={false}
                  className={`w-full bg-slate-950 border px-4 h-12 rounded-2xl font-mono text-sm outline-none transition ${
                    manualValidation === 'valid'
                      ? 'border-emerald-600 focus:border-emerald-500'
                      : manualValidation === 'invalid'
                        ? 'border-orange-600 focus:border-orange-500'
                        : 'border-slate-700 focus:border-sky-600'
                  }`}
                />
                <AddressValidationFeedback state={manualValidation} />
              </div>

              <button
                type="button"
                onClick={() => setShowQrScanner(true)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-sky-700/60 hover:border-sky-500 hover:bg-sky-950/30 h-12 rounded-2xl text-sm font-semibold text-sky-300 transition"
              >
                <ScanLine className="w-4 h-4" />
                Scan QR Code from Wallet App
              </button>

              <div className="flex gap-2">
                <button onClick={() => setStep('choose')} className="flex-1 border border-slate-600 h-11 rounded-2xl text-sm">
                  Back
                </button>
                <button
                  onClick={handleManualConnect}
                  disabled={!isManualAddressValid}
                  className="flex-1 bg-sky-700 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed h-11 rounded-2xl font-semibold text-sm transition"
                >
                  Save Address
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showQrScanner && (
        <QrScannerModal
          onScan={handleQrScan}
          onClose={() => setShowQrScanner(false)}
        />
      )}
    </div>
  );
}