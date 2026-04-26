import { Loader2 } from 'lucide-react';
import type { DbUser } from '../lib/db.types';

type Props = {
  users: DbUser[];
  loading: boolean;
  error: string | null;
  onPick: (id: string) => void;
};

const COLORS = [
  'bg-rose-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
];

export default function Welcome({ users, loading, error, onPick }: Props) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center mb-10">
        <div className="text-6xl mb-3">💪</div>
        <h1 className="text-3xl font-bold mb-1">Protein Tracker</h1>
        <p className="text-slate-500 dark:text-slate-400">Wer bist du?</p>
      </div>

      {loading && (
        <Loader2 size={32} className="animate-spin text-slate-400" />
      )}

      {error && (
        <div className="max-w-md w-full px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
          <p className="font-semibold mb-1">Verbindung zur Datenbank fehlgeschlagen</p>
          <p className="break-words text-xs">{error}</p>
          <p className="mt-2 text-xs">
            Hast du das Schema in Supabase schon installiert? Siehe <code>db/README.md</code>.
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {users.map((u, idx) => (
            <button
              key={u.id}
              onClick={() => onPick(u.id)}
              className="flex flex-col items-center justify-center py-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 active:scale-95 transition shadow-sm"
            >
              <div
                className={`w-20 h-20 rounded-full ${COLORS[idx % COLORS.length]} flex items-center justify-center text-white text-3xl font-bold mb-3`}
              >
                {u.name[0].toUpperCase()}
              </div>
              <div className="font-semibold text-lg">{u.name}</div>
              {u.weight_kg && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {Math.round(Number(u.weight_kg))} {u.weight_unit ?? 'kg'}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-slate-400 text-center max-w-xs">
        Daten werden in Supabase gespeichert. Eigene Gerichte und Produkte sind zwischen Olia und Sten geteilt — Tageseinträge bleiben getrennt.
      </p>
    </div>
  );
}
