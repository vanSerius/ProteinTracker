import { useEffect, useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { analyzePhoto, type AnalyzedItem, type AnalyzeResult } from '../lib/photoAnalyze';

type Props = {
  workerUrl: string;
  file: File;
  onClose: () => void;
  onConfirm: (items: AnalyzedItem[]) => void;
};

type Editable = AnalyzedItem & { selected: boolean };

export default function PhotoAnalyzeModal({ workerUrl, file, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [items, setItems] = useState<Editable[]>([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    analyzePhoto(workerUrl, file)
      .then((r) => {
        if (cancelled) return;
        setResult(r);
        setItems(r.items.map((i) => ({ ...i, selected: true })));
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workerUrl, file]);

  const updateItem = (idx: number, patch: Partial<Editable>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const totalSelected = items.filter((i) => i.selected).reduce((acc, i) => acc + i.proteinG, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-slate-50 dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera size={20} />
            <h3 className="text-lg font-bold">Photo analysis</h3>
          </div>
          <button onClick={onClose} className="p-2" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        {loading && (
          <div className="py-12 flex flex-col items-center text-slate-500 dark:text-slate-400">
            <Loader2 size={32} className="animate-spin mb-3" />
            <p className="text-sm">Analyzing your plate…</p>
          </div>
        )}

        {error && (
          <div className="py-6 px-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
            <p className="font-semibold mb-1">Couldn't analyze the photo</p>
            <p className="break-words">{error}</p>
            <p className="mt-2 text-xs">Check the Worker URL in Profile, or try a clearer photo.</p>
          </div>
        )}

        {!loading && !error && result && (
          <>
            {result.summary && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 italic">{result.summary}</p>
            )}

            {items.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No food detected.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((it, idx) => (
                  <li
                    key={idx}
                    className={`px-3 py-3 rounded-xl border ${
                      it.selected
                        ? 'bg-white dark:bg-slate-900 border-brand-500'
                        : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={it.selected}
                        onChange={(e) => updateItem(idx, { selected: e.target.checked })}
                        className="w-5 h-5 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <input
                          value={it.name}
                          onChange={(e) => updateItem(idx, { name: e.target.value })}
                          className="w-full bg-transparent font-medium border-b border-transparent focus:border-slate-300 dark:focus:border-slate-600 outline-none"
                        />
                        <div className="flex gap-2 mt-2 items-center">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400">grams</label>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={1}
                            step={5}
                            value={it.estimatedGrams}
                            onChange={(e) => {
                              const g = Number(e.target.value);
                              const ratio = it.estimatedGrams > 0 ? it.proteinG / it.estimatedGrams : 0;
                              updateItem(idx, { estimatedGrams: g, proteinG: Math.round(g * ratio) });
                            }}
                            className="w-20 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-sm tabular-nums"
                          />
                          <label className="text-[10px] text-slate-500 dark:text-slate-400">protein</label>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step={1}
                            value={it.proteinG}
                            onChange={(e) => updateItem(idx, { proteinG: Number(e.target.value) })}
                            className="w-16 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-sm tabular-nums"
                          />
                          {it.confidence && (
                            <span
                              className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                                it.confidence === 'high'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                  : it.confidence === 'medium'
                                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {it.confidence}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              disabled={totalSelected === 0}
              onClick={() => onConfirm(items.filter((i) => i.selected))}
              className="w-full mt-4 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-2xl text-lg font-semibold shadow-md active:scale-[0.98] transition"
            >
              Add {Math.round(totalSelected)} g protein
            </button>
          </>
        )}
      </div>
    </div>
  );
}
