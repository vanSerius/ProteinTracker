import { useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { lastNDates } from '../lib/date';
import BarChart from '../components/BarChart';

type Range = 7 | 30;

export default function History() {
  const { dailyGoalG, proteinForDate } = useApp();
  const [range, setRange] = useState<Range>(7);

  const data = useMemo(() => {
    const dates = lastNDates(range);
    const values = dates.map((d) => proteinForDate(d));
    return { dates, values };
  }, [range, proteinForDate]);

  const avg = data.values.length > 0 ? data.values.reduce((a, b) => a + b, 0) / data.values.length : 0;
  const hits = data.values.filter((v) => v >= dailyGoalG).length;

  let streak = 0;
  for (let i = data.values.length - 1; i >= 0; i--) {
    if (data.values[i] >= dailyGoalG) streak++;
    else break;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">History</h1>

      <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 mb-4">
        {([7, 30] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg ${
              range === r ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-500'
            }`}
          >
            {r} days
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 mb-4">
        <BarChart dates={data.dates} values={data.values} goal={dailyGoalG} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-2xl font-bold tabular-nums">{Math.round(avg)} g</div>
          <div className="text-xs text-slate-500">avg / day</div>
        </div>
        <div className="text-center py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-2xl font-bold tabular-nums">{hits}/{range}</div>
          <div className="text-xs text-slate-500">days hit goal</div>
        </div>
        <div className="text-center py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-2xl font-bold tabular-nums">{streak}</div>
          <div className="text-xs text-slate-500">streak</div>
        </div>
      </div>
    </div>
  );
}
