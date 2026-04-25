import { useCallback, useEffect, useMemo, useState } from 'react';
import { KEYS, load, save } from '../lib/storage';
import { todayISO } from '../lib/date';
import type { Entry } from '../types';

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>(() => load<Entry[]>(KEYS.entries, []));

  useEffect(() => {
    save(KEYS.entries, entries);
  }, [entries]);

  const add = useCallback((entry: Entry) => {
    setEntries((prev) => [...prev, entry]);
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const todayEntries = useMemo(() => {
    const today = todayISO();
    return entries
      .filter((e) => e.dateISO === today)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [entries]);

  const todayTotalG = useMemo(
    () => todayEntries.reduce((acc, e) => acc + e.proteinG, 0),
    [todayEntries],
  );

  const proteinForDate = useCallback(
    (iso: string) => entries.filter((e) => e.dateISO === iso).reduce((acc, e) => acc + e.proteinG, 0),
    [entries],
  );

  return { entries, add, remove, todayEntries, todayTotalG, proteinForDate };
}
