import { AddressValidationState } from '@/lib/bitcoinAddress';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AddressValidationFeedbackProps {
  state: AddressValidationState;
}

export default function AddressValidationFeedback({ state }: AddressValidationFeedbackProps) {
  if (state === 'empty') {
    return (
      <p className="text-xs text-slate-500 mt-2">
        Enter or scan a Bitcoin address (bc1q..., 1..., or 3...).
      </p>
    );
  }

  if (state === 'valid') {
    return (
      <div className="flex items-center gap-2 mt-2 text-sm text-emerald-400 font-medium">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Valid Bitcoin Address</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2 text-sm text-orange-400 font-medium">
      <XCircle className="w-4 h-4 shrink-0" />
      <span>Invalid Bitcoin Address</span>
    </div>
  );
}