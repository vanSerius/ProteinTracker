import { useEffect, useRef, useState } from 'react';
import { X, Loader2, ScanBarcode } from 'lucide-react';
import { startBarcodeScan, type ScanStop } from '../lib/barcode';

type Props = {
  onClose: () => void;
  onCode: (code: string) => void;
};

export default function BarcodeScannerModal({ onClose, onCode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopRef = useRef<ScanStop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!videoRef.current) return;
    const video = videoRef.current;

    startBarcodeScan(video, (code) => {
      if (cancelled) return;
      onCode(code);
    })
      .then((stop) => {
        if (cancelled) {
          stop();
          return;
        }
        stopRef.current = stop;
        setStarting(false);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message || 'Camera unavailable');
          setStarting(false);
        }
      });

    return () => {
      cancelled = true;
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [onCode]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-slate-950 text-white rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ScanBarcode size={20} />
            <h3 className="text-lg font-bold">Scan barcode</h3>
          </div>
          <button onClick={onClose} className="p-2" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="relative aspect-square bg-black rounded-2xl overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-1/3 border-2 border-emerald-400 rounded-xl" />
          </div>
          {starting && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 size={32} className="animate-spin" />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 py-3 px-4 rounded-xl bg-red-950/40 border border-red-900 text-sm text-red-300">
            {error}
          </div>
        )}

        <p className="text-xs text-slate-400 mt-3 text-center">
          Point camera at the product barcode. Detection happens automatically.
        </p>
      </div>
    </div>
  );
}
