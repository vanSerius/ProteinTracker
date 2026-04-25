import { useMemo, useState } from 'react';
import { Plus, Trash2, X, Search } from 'lucide-react';
import { useApp } from '../AppContext';
import { proteinForFood } from '../lib/proteinCalc';
import { uid } from '../lib/format';
import type { Food, Meal, MealIngredient } from '../types';

type Props = {
  initial?: Meal;
  onSave: (meal: Meal) => void;
  onCancel: () => void;
};

export default function MealBuilder({ initial, onSave, onCancel }: Props) {
  const { search } = useApp();
  const [name, setName] = useState(initial?.name ?? '');
  const [servings, setServings] = useState<number>(initial?.servings ?? 4);
  const [ingredients, setIngredients] = useState<MealIngredient[]>(initial?.ingredients ?? []);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState('');
  const [pickedFood, setPickedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState<number>(100);

  const totalProteinG = useMemo(
    () => ingredients.reduce((acc, i) => acc + i.proteinG, 0),
    [ingredients],
  );
  const perServing = totalProteinG / Math.max(servings, 1);

  const results = useMemo(() => (query ? search(query).slice(0, 20) : search('').slice(0, 20)), [query, search]);

  const addIngredient = () => {
    if (!pickedFood) return;
    const proteinG = proteinForFood(pickedFood, grams);
    setIngredients((prev) => [
      ...prev,
      { foodId: pickedFood.id, customName: pickedFood.name, grams, proteinG },
    ]);
    setPickedFood(null);
    setPicking(false);
    setQuery('');
    setGrams(100);
  };

  const removeIngredient = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const valid = name.trim().length > 0 && ingredients.length > 0 && servings > 0;
  const handleSave = () => {
    if (!valid) return;
    onSave({
      id: initial?.id ?? `meal-${uid()}`,
      name: name.trim(),
      ingredients,
      servings,
      totalProteinG,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Meal name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Gefüllte Paprika"
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Total servings (how many people / portions does it make?)</label>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={servings}
          onChange={(e) => setServings(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-lg font-semibold tabular-nums"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Ingredients</h3>
          <button
            onClick={() => setPicking(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-semibold"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        {ingredients.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No ingredients yet
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{ing.customName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{ing.grams} g · {Math.round(ing.proteinG)} g protein</div>
                </div>
                <button onClick={() => removeIngredient(idx)} className="ml-2 p-2 text-slate-400 hover:text-red-500" aria-label="Remove">
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="text-center py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-2xl font-bold tabular-nums">{Math.round(totalProteinG)} g</div>
          <div className="text-xs text-slate-500">total</div>
        </div>
        <div className="text-center py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-2xl font-bold tabular-nums">{Math.round(perServing)} g</div>
          <div className="text-xs text-slate-500">per serving</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-semibold">
          Cancel
        </button>
        <button
          disabled={!valid}
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold"
        >
          Save meal
        </button>
      </div>

      {picking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setPicking(false)}>
          <div className="w-full sm:max-w-md bg-slate-50 dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto safe-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">{pickedFood ? pickedFood.name : 'Pick ingredient'}</h3>
              <button onClick={() => { setPicking(false); setPickedFood(null); }} className="p-2"><X size={22} /></button>
            </div>

            {!pickedFood ? (
              <>
                <div className="relative mb-3">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search foods…"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <ul className="flex flex-col gap-2">
                  {results.map((f) => (
                    <li key={f.id}>
                      <button
                        onClick={() => setPickedFood(f)}
                        className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                      >
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-medium truncate">{f.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{f.proteinPer100g} g / 100 g</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{pickedFood.proteinPer100g} g protein per 100 g</p>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Grams used in the recipe</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={5}
                  value={grams}
                  onChange={(e) => setGrams(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-2xl font-bold tabular-nums"
                />
                <div className="mt-3 text-center py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-2xl font-bold">{Math.round(proteinForFood(pickedFood, grams))} g protein</div>
                </div>
                <button
                  onClick={addIngredient}
                  className="w-full mt-4 py-4 bg-brand-600 text-white rounded-2xl text-lg font-semibold"
                >
                  Add ingredient
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
