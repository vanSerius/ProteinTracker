import { useState } from 'react';
import { uid } from '../lib/format';
import type { Food } from '../types';

type Props = {
  onSubmit: (food: Food, grams: number, proteinG: number, save: boolean) => void;
};

export default function CustomFoodForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [grams, setGrams] = useState<number>(100);
  const [proteinPer100g, setProteinPer100g] = useState<number>(20);
  const [save, setSave] = useState(true);

  const totalProtein = (proteinPer100g * grams) / 100;
  const valid = name.trim().length > 0 && grams > 0 && proteinPer100g >= 0;

  const handleSubmit = () => {
    if (!valid) return;
    const food: Food = {
      id: `custom-${uid()}`,
      name: name.trim(),
      proteinPer100g,
      category: 'other',
      custom: true,
    };
    onSubmit(food, grams, totalProtein, save);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Food name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Restaurant chicken curry"
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Grams eaten</label>
          <input
            type="number"
            inputMode="decimal"
            min={1}
            value={grams}
            onChange={(e) => setGrams(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 tabular-nums"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Protein per 100 g</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={proteinPer100g}
            onChange={(e) => setProteinPer100g(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 tabular-nums"
          />
        </div>
      </div>

      <div className="text-center py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="text-3xl font-bold">{Math.round(totalProtein)} g</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">total protein</div>
      </div>

      <label className="flex items-center justify-between text-sm">
        <span>Save as favorite for later</span>
        <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="w-5 h-5" />
      </label>

      <button
        disabled={!valid}
        onClick={handleSubmit}
        className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-2xl text-lg font-semibold shadow-md active:scale-[0.98] transition"
      >
        Add to today
      </button>
    </div>
  );
}
