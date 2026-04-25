import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../AppContext';
import MealBuilder from '../components/MealBuilder';
import type { Meal } from '../types';

export default function Meals() {
  const { meals, addMeal, updateMeal, removeMeal } = useApp();
  const [editing, setEditing] = useState<Meal | null>(null);
  const [creating, setCreating] = useState(false);

  if (creating || editing) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{editing ? 'Edit meal' : 'New meal'}</h1>
        <MealBuilder
          initial={editing ?? undefined}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(meal) => {
            if (editing) updateMeal(editing.id, meal);
            else addMeal(meal);
            setCreating(false);
            setEditing(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My meals</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold"
        >
          <Plus size={16} /> New meal
        </button>
      </header>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Build a recipe once (e.g. stuffed peppers, lasagna). Log it later in one tap.
      </p>

      {meals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No meals yet.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {meals.map((m) => {
            const perServing = m.totalProteinG / Math.max(m.servings, 1);
            return (
              <li key={m.id} className="px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{m.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {m.ingredients.length} ingredients · {Math.round(perServing)} g / serving · {m.servings} servings
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(m)}
                    className="ml-2 p-2 text-slate-400 hover:text-brand-600"
                    aria-label="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${m.name}"?`)) removeMeal(m.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
