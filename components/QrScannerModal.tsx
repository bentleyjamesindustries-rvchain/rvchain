'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerModalProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const SCANNER_ELEMENT_ID = 'rvchain-qr-reader';

export default function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const handledRef = useRef(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner?.isScanning) {
      try {
        await scanner.stop();
      } catch {
        /* camera may already be stopped */
      }
    }
  }, []);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;
    handledRef.current = false;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: Math.min(280, window.innerWidth - 48), height: Math.min(280, window.innerWidth - 48) } },
        (decodedText) => {
          if (handledRef.current) return;
          handledRef.current = true;
          onScan(decodedText);
          stopScanner().then(onClose);
        },
        () => {
          /* no QR in frame — expected while scanning */
        }
      )
      .then(() => setStarting(false))
      .catch(() => {
        setStarting(false);
        setError('Camera access denied or unavailable. Allow camera permission in your browser settings and try again.');
      });

    return () => {
      stopScanner();
    };
  }, [onScan, onClose, stopScanner]);

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col sm:items-center sm:justify-center">
      <div className="flex items-center justify-between p-4 sm:absolute sm:top-0 sm:left-0 sm:right-0 sm:z-10 bg-black/80">
        <div className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5 text-sky-400" />
          <span className="font-semibold">Scan Wallet QR Code</span>
        </div>
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          aria-label="Close scanner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto px-4 sm:pt-16">
        {error ? (
          <div className="text-center text-amber-200 bg-amber-950/50 border border-amber-700/50 rounded-2xl p-6 max-w-sm">
            <p className="text-sm leading-relaxed">{error}</p>
            <button
              onClick={handleClose}
              className="mt-4 bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-xl text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <div
              id={SCANNER_ELEMENT_ID}
              className="w-full rounded-2xl overflow-hidden border-2 border-sky-600/50"
            />
            {starting && (
              <p className="text-slate-400 text-sm mt-4 animate-pulse">Starting camera...</p>
            )}
            <p className="text-slate-400 text-xs text-center mt-4 max-w-xs leading-relaxed">
              Point your camera at the Bitcoin receive QR code in your wallet app. The address will fill in automatically.
            </p>
          </>
        )}
      </div>
    </div>
  );
}