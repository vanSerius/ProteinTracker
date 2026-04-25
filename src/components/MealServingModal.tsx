import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Meal } from '../types';

type Props = {
  meal: Meal;
  onClose: () => void;
  onSave: (servings: number, proteinG: number) => void;
};

const QUICK = [0.5, 1, 1.5, 2];

export default function MealServingModal({ meal, onClose, onSave }: Props) {
  const [servings, setServings] = useState<number>(1);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const perServing = meal.totalProteinG / Math.max(meal.servings, 1);
  const protein = perServing * servings;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-slate-50 dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl p-5 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold">{meal.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round(perServing)} g protein per serving · {meal.servings} servings total
            </p>
          </div>
          <button onClick={onClose} className="p-2" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setServings(q)}
              className={`py-3 rounded-xl border font-bold ${
                servings === q
                  ? 'bg-brand-50 dark:bg-brand-700/20 border-brand-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {q === 0.5 ? '½' : q}
            </button>
          ))}
        </div>

        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Servings</label>
        <input
          type="number"
          inputMode="decimal"
          min={0.25}
          max={meal.servings}
          step={0.25}
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xl font-bold tabular-nums"
        />

        <div className="mt-4 text-center py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-3xl font-bold">{Math.round(protein)} g protein</div>
        </div>

        <button
          onClick={() => onSave(servings, protein)}
          className="w-full mt-4 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-lg font-semibold shadow-md active:scale-[0.98] transition"
        >
          Add {Math.round(protein)} g protein
        </button>
      </div>
    </div>
  );
}
