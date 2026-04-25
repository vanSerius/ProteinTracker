import { Trash2 } from 'lucide-react';
import type { Entry, Food, Meal } from '../types';
import { clockTime, grams } from '../lib/format';

type Props = {
  entry: Entry;
  food?: Food;
  meal?: Meal;
  onRemove: (id: string) => void;
};

export default function EntryRow({ entry, food, meal, onRemove }: Props) {
  const name = entry.customName || food?.name || meal?.name || 'Unknown';
  const sub = meal
    ? `${entry.grams === meal.servings ? meal.servings : entry.grams} serving${entry.grams !== 1 ? 's' : ''}`
    : grams(entry.grams);
  return (
    <li className="flex items-center justify-between py-3 px-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{name}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {sub} · {clockTime(entry.timestamp)}
        </div>
      </div>
      <div className="text-right ml-3">
        <div className="font-semibold tabular-nums">{grams(entry.proteinG)}</div>
        <div className="text-[10px] text-slate-400">protein</div>
      </div>
      <button
        onClick={() => onRemove(entry.id)}
        className="ml-3 p-2 text-slate-400 hover:text-red-500 active:scale-95 transition"
        aria-label="Delete entry"
      >
        <Trash2 size={18} />
      </button>
    </li>
  );
}
