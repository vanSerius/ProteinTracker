const SCHEMA_VERSION = 1;
const VERSION_KEY = 'pt.schemaVersion';

function ensureSchema() {
  if (typeof window === 'undefined') return;
  const v = window.localStorage.getItem(VERSION_KEY);
  if (!v) window.localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
}

export function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  ensureSchema();
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  ensureSchema();
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function remove(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  ['pt.profile', 'pt.entries', 'pt.customFoods', 'pt.favorites', 'pt.meals', 'pt.workerUrl', VERSION_KEY].forEach((k) =>
    window.localStorage.removeItem(k),
  );
}

export const KEYS = {
  profile: 'pt.profile',
  entries: 'pt.entries',
  customFoods: 'pt.customFoods',
  favorites: 'pt.favorites',
  meals: 'pt.meals',
  workerUrl: 'pt.workerUrl',
} as const;
