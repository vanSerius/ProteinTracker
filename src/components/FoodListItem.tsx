import type { Food } from '../types';

type Props = {
  food: Food;
  onTap: () => void;
  rightHint?: string;
};

export default function FoodListItem({ food, onTap, rightHint }: Props) {
  return (
    <button
      onClick={onTap}
      className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 active:scale-[0.99] transition"
    >
      <div className="text-left flex-1 min-w-0">
        <div className="font-medium truncate">{food.name}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {food.proteinPer100g} g / 100 g
        </div>
      </div>
      {rightHint && (
        <div className="ml-3 text-xs text-slate-400">{rightHint}</div>
      )}
    </button>
  );
}
