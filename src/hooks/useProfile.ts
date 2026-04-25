import { useCallback, useEffect, useState } from 'react';
import { KEYS, load, save } from '../lib/storage';
import { calculateGoal } from '../lib/goal';
import type { Profile } from '../types';

const DEFAULT_PROFILE: Profile = {
  weightKg: 65,
  weightUnit: 'kg',
  activityLevel: 'active',
  goalType: 'build_muscle',
  goalOverrideG: undefined,
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(() => load<Profile>(KEYS.profile, DEFAULT_PROFILE));

  useEffect(() => {
    save(KEYS.profile, profile);
  }, [profile]);

  const update = useCallback((patch: Partial<Profile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const dailyGoalG = profile.goalOverrideG ?? calculateGoal(profile.weightKg, profile.activityLevel, profile.goalType);

  return { profile, update, dailyGoalG };
}
