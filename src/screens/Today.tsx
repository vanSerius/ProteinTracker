import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useApp } from '../AppContext';
import ProgressRing from '../components/ProgressRing';
import EntryRow from '../components/EntryRow';
import { format } from 'date-fns';

export default function Today() {
  const { dailyGoalG, todayEntries, todayTotalG, remove, findFood, findMeal } = useApp();

  return (
    <div className="max-w-md mx-auto p-4">
      <header className="flex items-baseline justify-between mb-2">
        <h1 className="text-2xl font-bold">Today</h1>
        <span className="text-sm text-slate-500 dark:text-slate-400">{format(new Date(), 'EEE, d MMM')}</span>
      </header>

      <section className="flex justify-center my-6">
        <ProgressRing current={todayTotalG} goal={dailyGoalG} />
      </section>

      <Link
        to="/add"
        className="flex items-center justify-center gap-2 w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-semibold shadow-md active:scale-[0.98] transition"
      >
        <Plus size={20} /> Add food
      </Link>

      <h2 className="mt-6 mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
        Today's entries ({todayEntries.length})
      </h2>
      {todayEntries.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
          Nothing logged yet. Tap "Add food" to start.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todayEntries.map((e) => (
            <EntryRow
              key={e.id}
              entry={e}
              food={e.foodId ? findFood(e.foodId) : undefined}
              meal={e.source === 'meal' && e.foodId ? findMeal(e.foodId) : undefined}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
