import { useCallback, useEffect, useState } from 'react';
import { KEYS, load, save, remove } from '../lib/storage';

export function useWorkerUrl() {
  const [workerUrl, setWorkerUrl] = useState<string>(() => load<string>(KEYS.workerUrl, ''));

  useEffect(() => {
    if (workerUrl) save(KEYS.workerUrl, workerUrl);
    else remove(KEYS.workerUrl);
  }, [workerUrl]);

  const setWorker = useCallback((url: string) => {
    setWorkerUrl(url.trim());
  }, []);

  return { workerUrl, setWorker, hasWorker: workerUrl.length > 0 };
}
