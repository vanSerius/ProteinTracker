import { useEffect, useState } from 'react';
import { X, Heart } from 'lucide-react';
import type { Food } from '../types';
import { proteinForFood } from '../lib/proteinCalc';
import PortionSizePicker from './PortionSizePicker';

type Mode = 'preset' | 'visual' | 'grams';

type Props = {
  food: Food;
  isFavorite: boolean;
  onClose: () => void;
  onSave: (grams: number, proteinG: number) => void;
  onToggleFavorite: () => void;
};

export default function ServingModal({ food, isFavorite, onClose, onSave, onToggleFavorite }: Props) {
  const initialGrams = food.commonServings?.[0]?.grams ?? 100;
  const [mode, setMode] = useState<Mode>(food.commonServings?.length ? 'preset' : 'grams');
  const [grams, setGrams] = useState<number>(initialGrams);
  const [visualKey, setVisualKey] = useState<string | undefined>();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const protein = proteinForFood(food, grams);

  const TabBtn = ({ k, label }: { k: Mode; label: string }) => (
    <button
      onClick={() => setMode(k)}
      className={`flex-1 py-2 text-sm font-semibold rounded-lg ${
        mode === k ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-slate-50 dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="text-lg font-bold truncate">{food.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{food.proteinPer100g} g protein per 100 g</p>
          </div>
          <button onClick={onToggleFavorite} className="p-2" aria-label="Toggle favorite">
            <Heart size={22} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
          </button>
          <button onClick={onClose} className="p-2" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 mb-4 gap-1">
          {food.commonServings?.length ? <TabBtn k="preset" label="Common" /> : null}
          <TabBtn k="visual" label="Size" />
          <TabBtn k="grams" label="Grams" />
        </div>

        {mode === 'preset' && food.commonServings?.length ? (
          <div className="flex flex-col gap-2">
            {food.commonServings.map((s) => (
              <button
                key={s.label}
                onClick={() => setGrams(s.grams)}
                className={`flex justify-between items-center px-4 py-3 rounded-xl border ${
                  grams === s.grams
                    ? 'bg-brand-50 dark:bg-brand-700/20 border-brand-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="font-medium">{s.label}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{s.grams} g</span>
              </button>
            ))}
          </div>
        ) : null}

        {mode === 'visual' && (
          <PortionSizePicker
            food={food}
            selected={visualKey}
            onSelect={(p) => {
              setVisualKey(p.key);
              setGrams(p.defaultGrams);
            }}
          />
        )}

        {mode === 'grams' && (
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Grams</label>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={2000}
              step={5}
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-2xl font-bold tabular-nums"
            />
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={() => setGrams((g) => Math.max(1, g - 10))}
            className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-lg"
          >
            −10
          </button>
          <div className="flex-1 text-center py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-3xl font-bold tabular-nums">{grams} g</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{Math.round(protein)} g protein</div>
          </div>
          <button
            onClick={() => setGrams((g) => g + 10)}
            className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-lg"
          >
            +10
          </button>
        </div>

        <button
          onClick={() => onSave(grams, protein)}
          className="w-full mt-4 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-lg font-semibold shadow-md active:scale-[0.98] transition"
        >
          Add {Math.round(protein)} g protein
        </button>
      </div>
    </div>
  );
}
