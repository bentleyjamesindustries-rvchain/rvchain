import { AlertTriangle } from 'lucide-react';

export default function WalletSecurityNotice({ onAccept }: { onAccept?: () => void }) {
  return (
    <div className="bg-amber-950/50 border-2 border-amber-600/60 rounded-2xl p-4 sm:p-5">
      <div className="flex gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <div className="font-bold text-amber-200 text-base">
            IMPORTANT SECURITY NOTICE – YOU CONTROL YOUR FUNDS
          </div>
          <p className="text-amber-100/90 leading-relaxed">
            RV Chain does not own, control, or hold your Bitcoin wallet or funds.
            You are fully responsible for your own security and private keys.
          </p>
          <ul className="text-amber-100/80 space-y-1 list-disc list-inside text-xs sm:text-sm">
            <li>Whether you create a new wallet or connect an existing one — only you control access.</li>
            <li>Always back up your seed phrases and never share them.</li>
            <li>We cannot recover lost funds or reset passwords for external wallets.</li>
            <li>Use strong security practices on your devices and accounts.</li>
            <li>Start with small amounts to build confidence.</li>
          </ul>
          <p className="text-amber-200/90 font-medium text-xs pt-1">
            By continuing, you accept full responsibility for your wallet security.
          </p>
          {onAccept && (
            <button
              onClick={onAccept}
              className="mt-2 text-xs bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition"
            >
              I Understand — Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}