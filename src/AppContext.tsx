import { createContext, ReactNode, useContext } from 'react';
import { useEntries } from './hooks/useEntries';
import { useFoods } from './hooks/useFoods';
import { useMeals } from './hooks/useMeals';
import { useProfile } from './hooks/useProfile';
import { useUser } from './hooks/useUser';
import { useWorkerUrl } from './hooks/useWorkerUrl';

type AppState = ReturnType<typeof useProfile> &
  ReturnType<typeof useEntries> &
  ReturnType<typeof useFoods> &
  ReturnType<typeof useMeals> &
  ReturnType<typeof useWorkerUrl> &
  ReturnType<typeof useUser>;

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const user = useUser();
  const profile = useProfile(user.userId);
  const entries = useEntries(user.userId);
  const foods = useFoods(user.userId);
  const meals = useMeals(user.userId);
  const worker = useWorkerUrl(user.userId);
  const value: AppState = { ...user, ...profile, ...entries, ...foods, ...meals, ...worker };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
