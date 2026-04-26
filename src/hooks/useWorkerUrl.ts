import { useCallback, useEffect, useState } from 'react';
import { getUser, updateUser } from '../lib/db';

export function useWorkerUrl(userId: string | null) {
  const [workerUrl, setWorkerUrl] = useState<string>('');

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getUser(userId)
      .then((u) => {
        if (cancelled || !u) return;
        setWorkerUrl(u.worker_url ?? '');
      })
      .catch((e) => console.error('useWorkerUrl load:', e));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setWorker = useCallback(
    async (url: string) => {
      const trimmed = url.trim();
      setWorkerUrl(trimmed);
      if (!userId) return;
      try {
        await updateUser(userId, { worker_url: trimmed || null });
      } catch (e) {
        console.error('useWorkerUrl setWorker:', e);
      }
    },
    [userId],
  );

  return { workerUrl, setWorker, hasWorker: workerUrl.length > 0 };
}
