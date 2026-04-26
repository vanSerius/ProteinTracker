import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { OffProduct } from '../lib/openFoodFacts';

type Props = {
  product: OffProduct;
  onClose: () => void;
  onConfirm: (grams: number, proteinG: number) => void;
};

const QUICK = [50, 100, 150, 200, 250];

export default function ProductConfirmModal({ product, onClose, onConfirm }: Props) {
  const [grams, setGrams] = useState<number>(100);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const protein = (product.proteinPer100g * grams) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-slate-50 dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl p-5 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold truncate">{product.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {product.brand ? `${product.brand} · ` : ''}{product.proteinPer100g} g protein per 100 g
            </p>
          </div>
          <button onClick={onClose} className="p-2" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        {product.imageUrl && (
          <img src={product.imageUrl} alt="" className="w-24 h-24 object-contain mx-auto mb-3 rounded-lg bg-white" />
        )}

        <div className="grid grid-cols-5 gap-2 mb-3">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setGrams(q)}
              className={`py-3 rounded-xl border font-bold text-sm ${
                grams === q
                  ? 'bg-brand-50 dark:bg-brand-700/20 border-brand-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {q} g
            </button>
          ))}
        </div>

        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Grams eaten</label>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          step={5}
          value={grams}
          onChange={(e) => setGrams(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-2xl font-bold tabular-nums"
        />

        <div className="mt-4 text-center py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-3xl font-bold tabular-nums">{Math.round(protein)} g protein</div>
        </div>

        <button
          onClick={() => onConfirm(grams, protein)}
          className="w-full mt-4 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-lg font-semibold shadow-md active:scale-[0.98] transition"
        >
          Add {Math.round(protein)} g protein
        </button>
      </div>
    </div>
  );
}
