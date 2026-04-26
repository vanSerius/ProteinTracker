import { useCallback, useEffect, useMemo, useState } from 'react';
import { todayISO } from '../lib/date';
import { deleteEntry, insertEntry, listEntriesForUser } from '../lib/db';
import type { Entry } from '../types';

export function useEntries(userId: string | null) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await listEntriesForUser(userId);
      setEntries(list);
    } catch (e) {
      console.error('useEntries load:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // Refetch on focus so entries logged on another device show up.
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  const add = useCallback(
    async (entry: Entry) => {
      if (!userId) return;
      setEntries((prev) => [entry, ...prev]);
      try {
        await insertEntry(userId, entry);
      } catch (e) {
        console.error('useEntries add:', e);
        setEntries((prev) => prev.filter((x) => x.id !== entry.id));
      }
    },
    [userId],
  );

  const remove = useCallback(async (id: string) => {
    const prev = entries;
    setEntries((p) => p.filter((e) => e.id !== id));
    try {
      await deleteEntry(id);
    } catch (e) {
      console.error('useEntries remove:', e);
      setEntries(prev);
    }
  }, [entries]);

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

  return { entries, add, remove, todayEntries, todayTotalG, proteinForDate, entriesLoading: loading, reloadEntries: load };
}
