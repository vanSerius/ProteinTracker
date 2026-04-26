import { useCallback, useEffect, useState } from 'react';
import { listUsers } from '../lib/db';
import type { DbUser } from '../lib/db.types';

const KEY_USER_ID = 'pt.userId';

export function useUser() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [userId, setUserIdState] = useState<string | null>(() =>
    typeof window !== 'undefined' ? window.localStorage.getItem(KEY_USER_ID) : null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listUsers();
      setUsers(list);
      // Reset selection if the stored id no longer exists.
      if (userId && !list.some((u) => u.id === userId)) {
        setUserIdState(null);
        window.localStorage.removeItem(KEY_USER_ID);
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const setUserId = useCallback((id: string | null) => {
    setUserIdState(id);
    if (id) window.localStorage.setItem(KEY_USER_ID, id);
    else window.localStorage.removeItem(KEY_USER_ID);
  }, []);

  const currentUser = userId ? users.find((u) => u.id === userId) ?? null : null;

  return { users, userId, currentUser, setUserId, loading, error, reload: load };
}
