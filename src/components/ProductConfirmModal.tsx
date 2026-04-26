import { useEffect, useMemo, useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import type { OffProduct } from '../lib/openFoodFacts';
import { inferUnit, type UnitHint } from '../lib/unitInference';

type Props = {
  product: OffProduct;
  onClose: () => void;
  onConfirm: (grams: number, proteinG: number) => void;
};

type Mode = 'pieces' | 'spoons' | 'package' | 'grams';

const SPOON_DEFAULTS = { tbsp: 15, tsp: 5 };

export default function ProductConfirmModal({ product, onClose, onConfirm }: Props) {
  const hint: UnitHint = useMemo(() => inferUnit(product), [product]);

  const initialMode: Mode = useMemo(() => {
    if (hint.unit === 'spoon') return 'spoons';
    if (hint.unit === 'cup' && product.packageGrams) return 'package';
    return 'pieces';
  }, [hint.unit, product.packageGrams]);

  const [mode, setMode] = useState<Mode>(initialMode);

  const [pieceCount, setPieceCount] = useState<number>(1);
  const [pieceGrams, setPieceGrams] = useState<number>(hint.defaultGrams);

  const [spoonCount, setSpoonCount] = useState<number>(1);
  const [spoonSize, setSpoonSize] = useState<'tbsp' | 'tsp'>('tbsp');
  const [customSpoonGrams, setCustomSpoonGrams] = useState<number | null>(null);
  const spoonGrams = customSpoonGrams ?? SPOON_DEFAULTS[spoonSize];

  const [packageFrac, setPackageFrac] = useState<number>(1);

  const [grams, setGrams] = useState<number>(100);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const totalGrams = useMemo(() => {
    if (mode === 'pieces') return Math.max(0, pieceCount * pieceGrams);
    if (mode === 'spoons') return Math.max(0, spoonCount * spoonGrams);
    if (mode === 'package') return Math.max(0, (product.packageGrams ?? 0) * packageFrac);
    return Math.max(0, grams);
  }, [mode, pieceCount, pieceGrams, spoonCount, spoonGrams, packageFrac, product.packageGrams, grams]);

  const protein = (product.proteinPer100g * totalGrams) / 100;

  const TabBtn = ({ k, label }: { k: Mode; label: string }) => (
    <button
      onClick={() => setMode(k)}
      className={`flex-1 py-2 px-2 text-sm font-semibold rounded-lg whitespace-nowrap ${
        mode === k ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'
      }`}
    >
      {label}
    </button>
  );

  const Stepper = ({ value, setValue, step = 1, min = 0 }: { value: number; setValue: (n: number) => void; step?: number; min?: number }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setValue(Math.max(min, +(value - step).toFixed(2)))}
        className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold flex items-center justify-center"
      >
        <Minus size={18} />
      </button>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="flex-1 text-center px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-2xl font-bold tabular-nums"
      />
      <button
        onClick={() => setValue(+(value + step).toFixed(2))}
        className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold flex items-center justify-center"
      >
        <Plus size={18} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-slate-50 dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold truncate">{product.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {product.brand ? `${product.brand} · ` : ''}
              {product.proteinPer100g} g Protein/100 g
              {product.packageGrams ? ` · Pack: ${product.packageGrams} g` : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        {product.imageUrl && (
          <img src={product.imageUrl} alt="" className="w-20 h-20 object-contain mx-auto mb-3 rounded-lg bg-white" />
        )}

        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 mb-4 gap-1 text-sm">
          <TabBtn k="pieces" label={hint.unit === 'slice' ? '🍞 Scheiben' : `${hint.emoji} Stück`} />
          <TabBtn k="spoons" label="🥄 Löffel" />
          {product.packageGrams ? <TabBtn k="package" label="📦 Packung" /> : null}
          <TabBtn k="grams" label="⚖️ g" />
        </div>

        {mode === 'pieces' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Wie viele {hint.label.toLowerCase()} hast du gegessen?
            </p>
            <Stepper value={pieceCount} setValue={setPieceCount} step={1} min={0} />
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                1 {hint.label.replace(/n$/, '').toLowerCase()} ≈ Gramm
                {product.servingGrams ? <span className="text-emerald-500"> (von Verpackung)</span> : null}
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={1}
                step={1}
                value={pieceGrams}
                onChange={(e) => setPieceGrams(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 tabular-nums"
              />
            </div>
          </div>
        )}

        {mode === 'spoons' && (
          <div className="space-y-3">
            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 text-sm">
              {(['tbsp', 'tsp'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setSpoonSize(k);
                    setCustomSpoonGrams(null);
                  }}
                  className={`flex-1 py-2 rounded-lg font-semibold ${
                    spoonSize === k ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'
                  }`}
                >
                  {k === 'tbsp' ? 'Esslöffel (15 g)' : 'Teelöffel (5 g)'}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wie viele Löffel?</p>
            <Stepper value={spoonCount} setValue={setSpoonCount} step={1} min={0} />
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                1 {spoonSize === 'tbsp' ? 'EL' : 'TL'} ≈ Gramm (anpassen falls nötig)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={1}
                step={1}
                value={spoonGrams}
                onChange={(e) => setCustomSpoonGrams(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 tabular-nums"
              />
            </div>
          </div>
        )}

        {mode === 'package' && product.packageGrams ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Wie viel von der Packung ({product.packageGrams} g)?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <button
                  key={f}
                  onClick={() => setPackageFrac(f)}
                  className={`py-3 rounded-xl border font-bold ${
                    packageFrac === f
                      ? 'bg-brand-50 dark:bg-brand-700/20 border-brand-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {f === 1 ? 'Ganz' : f === 0.5 ? '½' : f === 0.25 ? '¼' : '¾'}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Anteil (0–1)</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={1}
                step={0.05}
                value={packageFrac}
                onChange={(e) => setPackageFrac(Math.max(0, Math.min(1, Number(e.target.value))))}
                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 tabular-nums"
              />
            </div>
          </div>
        ) : null}

        {mode === 'grams' && (
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Gramm</label>
            <Stepper value={grams} setValue={setGrams} step={5} min={1} />
          </div>
        )}

        <div className="mt-5 text-center py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-3xl font-bold tabular-nums">{Math.round(totalGrams)} g</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">≈ {Math.round(protein)} g Protein</div>
        </div>

        <button
          onClick={() => onConfirm(totalGrams, protein)}
          disabled={totalGrams <= 0}
          className="w-full mt-4 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-2xl text-lg font-semibold shadow-md active:scale-[0.98] transition"
        >
          {Math.round(protein)} g Protein hinzufügen
        </button>
      </div>
    </div>
  );
}
