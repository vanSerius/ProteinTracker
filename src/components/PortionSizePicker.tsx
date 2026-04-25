import { presetsForFood, type PortionPreset } from '../data/portionPresets';
import type { Food } from '../types';

type Props = {
  food: Food;
  selected?: string;
  onSelect: (preset: PortionPreset) => void;
};

export default function PortionSizePicker({ food, selected, onSelect }: Props) {
  const presets = presetsForFood(food);
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
        Don't know how many grams? Pick the closest size — taps fill in the grams below.
      </p>
      <div className="grid grid-cols-5 gap-2">
        {presets.map((p) => {
          const active = selected === p.key;
          return (
            <button
              key={p.key}
              onClick={() => onSelect(p)}
              className={`flex flex-col items-center justify-center min-h-[88px] rounded-xl px-1 py-2 border text-center ${
                active
                  ? 'bg-brand-50 dark:bg-brand-700/20 border-brand-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="text-2xl">{p.emoji}</div>
              <div className="text-sm font-bold">{p.label}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {p.defaultGrams} g
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
          {presets.find((p) => p.key === selected)?.comparison}
        </div>
      )}
    </div>
  );
}
