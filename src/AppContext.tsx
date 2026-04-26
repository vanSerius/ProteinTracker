import { createContext, ReactNode, useContext } from 'react';
import { useEntries } from './hooks/useEntries';
import { useFoods } from './hooks/useFoods';
import { useMeals } from './hooks/useMeals';
import { useProfile } from './hooks/useProfile';
import { useWorkerUrl } from './hooks/useWorkerUrl';

type AppState = ReturnType<typeof useProfile> &
  ReturnType<typeof useEntries> &
  ReturnType<typeof useFoods> &
  ReturnType<typeof useMeals> &
  ReturnType<typeof useWorkerUrl>;

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const profile = useProfile();
  const entries = useEntries();
  const foods = useFoods();
  const meals = useMeals();
  const worker = useWorkerUrl();
  const value: AppState = { ...profile, ...entries, ...foods, ...meals, ...worker };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
