import { useState } from 'react';
import { Camera, LogOut } from 'lucide-react';
import { useApp } from '../AppContext';
import { calculateGoal, kgToLb, lbToKg, type ActivityLevel, type GoalType, type WeightUnit } from '../lib/goal';
import type { Sex } from '../types';

const ACTIVITY: { value: ActivityLevel; label: string; sub: string }[] = [
  { value: 'sedentary', label: 'Sedentary', sub: 'desk job, little exercise' },
  { value: 'light', label: 'Light', sub: '1–3 light workouts/week' },
  { value: 'active', label: 'Active', sub: '3–5 workouts/week' },
  { value: 'very_active', label: 'Very active', sub: 'daily intense training' },
];

const GOAL: { value: GoalType; label: string; sub: string }[] = [
  { value: 'maintain', label: 'Maintain', sub: 'stay where you are' },
  { value: 'lose_fat', label: 'Lose fat', sub: 'preserve muscle while cutting' },
  { value: 'build_muscle', label: 'Build muscle', sub: 'gain lean mass' },
];

const SEX: { value: Sex; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

export default function Profile() {
  const { profile, update, dailyGoalG, workerUrl, setWorker, currentUser, setUserId } = useApp();
  const [draftWorker, setDraftWorker] = useState(workerUrl);

  const computed = calculateGoal(profile.weightKg, profile.activityLevel, profile.goalType);
  const usingOverride = profile.goalOverrideG !== undefined;

  const setUnit = (u: WeightUnit) => update({ weightUnit: u });
  const setWeightInput = (val: number) => {
    const kg = profile.weightUnit === 'lb' ? lbToKg(val) : val;
    update({ weightKg: kg });
  };
  const displayWeight = profile.weightUnit === 'lb' ? kgToLb(profile.weightKg) : profile.weightKg;

  const switchUser = () => {
    if (confirm('Zurück zur Benutzer-Auswahl?')) {
      setUserId(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center text-xl font-bold">
            {currentUser?.name[0].toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Hi,</div>
            <div className="text-xl font-bold">{currentUser?.name ?? 'Profile'}</div>
          </div>
        </div>
        <button
          onClick={switchUser}
          className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <LogOut size={14} /> Switch user
        </button>
      </header>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
          Weight
        </h2>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            min={20}
            max={300}
            step={0.1}
            value={Number(displayWeight.toFixed(1))}
            onChange={(e) => setWeightInput(Number(e.target.value))}
            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-lg font-semibold tabular-nums"
          />
          <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1">
            {(['kg', 'lb'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-4 rounded-lg text-sm font-semibold ${
                  profile.weightUnit === u
                    ? 'bg-white dark:bg-slate-700 shadow'
                    : 'text-slate-500'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
          Activity level
        </h2>
        <div className="flex flex-col gap-2">
          {ACTIVITY.map((a) => (
            <button
              key={a.value}
              onClick={() => update({ activityLevel: a.value })}
              className={`text-left px-4 py-3 rounded-xl border ${
                profile.activityLevel === a.value
                  ? 'bg-brand-50 dark:bg-brand-700/20 border-brand-500 text-brand-700 dark:text-brand-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="font-semibold">{a.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{a.sub}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
          Goal
        </h2>
        <div className="flex flex-col gap-2">
          {GOAL.map((g) => (
            <button
              key={g.value}
              onClick={() => update({ goalType: g.value })}
              className={`text-left px-4 py-3 rounded-xl border ${
                profile.goalType === g.value
                  ? 'bg-brand-50 dark:bg-brand-700/20 border-brand-500 text-brand-700 dark:text-brand-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="font-semibold">{g.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{g.sub}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
            Daily protein target
          </h2>
          <span className="text-3xl font-bold tabular-nums">{dailyGoalG} g</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Calculated: {computed} g (based on weight × activity × goal)
        </p>
        <label className="flex items-center justify-between text-sm">
          <span className="font-medium">Override target</span>
          <input
            type="checkbox"
            checked={usingOverride}
            onChange={(e) =>
              update({ goalOverrideG: e.target.checked ? computed : undefined })
            }
            className="w-5 h-5"
          />
        </label>
        {usingOverride && (
          <input
            type="number"
            inputMode="numeric"
            min={20}
            max={400}
            step={5}
            value={profile.goalOverrideG ?? computed}
            onChange={(e) => update({ goalOverrideG: Number(e.target.value) })}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-semibold tabular-nums"
          />
        )}
      </section>

      <section className="mb-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-3">
          About you (optional)
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Height (cm)</label>
            <input
              type="number"
              inputMode="numeric"
              min={100}
              max={250}
              step={1}
              value={profile.heightCm ?? ''}
              onChange={(e) => update({ heightCm: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Age</label>
            <input
              type="number"
              inputMode="numeric"
              min={10}
              max={120}
              step={1}
              value={profile.age ?? ''}
              onChange={(e) => update({ age: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums"
            />
          </div>
        </div>
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Sex</label>
        <div className="flex gap-2">
          {SEX.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ sex: profile.sex === s.value ? undefined : s.value })}
              className={`flex-1 py-2 rounded-xl border text-sm font-semibold ${
                profile.sex === s.value
                  ? 'bg-brand-50 dark:bg-brand-700/20 border-brand-500 text-brand-700 dark:text-brand-500'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-2">
          <Camera size={16} /> Photo recognition (optional)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Paste your Cloudflare Worker URL to enable plate-photo logging. See <code className="text-[11px]">worker/README.md</code> in the repo for the 10-minute setup.
        </p>
        <input
          type="url"
          inputMode="url"
          placeholder="https://protein-tracker-worker.<you>.workers.dev"
          value={draftWorker}
          onChange={(e) => setDraftWorker(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
        />
        <button
          onClick={() => setWorker(draftWorker)}
          disabled={draftWorker === workerUrl}
          className="w-full mt-2 py-2 rounded-xl bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-semibold"
        >
          {workerUrl && draftWorker === workerUrl ? 'Saved' : 'Save'}
        </button>
        {workerUrl && (
          <button
            onClick={() => {
              setWorker('');
              setDraftWorker('');
            }}
            className="w-full mt-2 py-2 rounded-xl text-slate-500 text-xs"
          >
            Remove
          </button>
        )}
      </section>
    </div>
  );
}
