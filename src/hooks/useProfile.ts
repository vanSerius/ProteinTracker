import { useCallback, useEffect, useState } from 'react';
import { calculateGoal } from '../lib/goal';
import { getUser, updateUser } from '../lib/db';
import type { DbUser } from '../lib/db.types';
import type { Profile } from '../types';

const DEFAULT_PROFILE: Profile = {
  weightKg: 65,
  weightUnit: 'kg',
  activityLevel: 'active',
  goalType: 'build_muscle',
};

function fromDb(u: DbUser): Profile {
  return {
    weightKg: u.weight_kg != null ? Number(u.weight_kg) : DEFAULT_PROFILE.weightKg,
    weightUnit: u.weight_unit ?? 'kg',
    activityLevel: u.activity_level ?? 'active',
    goalType: u.goal_type ?? 'build_muscle',
    goalOverrideG: u.goal_override_g ?? undefined,
    heightCm: u.height_cm ?? undefined,
    age: u.age ?? undefined,
    sex: u.sex ?? undefined,
  };
}

function toDbPatch(p: Partial<Profile>): Partial<DbUser> {
  const out: Partial<DbUser> = {};
  if (p.weightKg !== undefined) out.weight_kg = p.weightKg;
  if (p.weightUnit !== undefined) out.weight_unit = p.weightUnit;
  if (p.activityLevel !== undefined) out.activity_level = p.activityLevel;
  if (p.goalType !== undefined) out.goal_type = p.goalType;
  if ('goalOverrideG' in p) out.goal_override_g = p.goalOverrideG ?? null;
  if ('heightCm' in p) out.height_cm = p.heightCm ?? null;
  if ('age' in p) out.age = p.age ?? null;
  if ('sex' in p) out.sex = p.sex ?? null;
  return out;
}

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getUser(userId)
      .then((u) => {
        if (cancelled || !u) return;
        setProfile(fromDb(u));
      })
      .catch((e) => console.error('useProfile load:', e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const update = useCallback(
    async (patch: Partial<Profile>) => {
      if (!userId) return;
      setProfile((p) => ({ ...p, ...patch }));
      try {
        await updateUser(userId, toDbPatch(patch));
      } catch (e) {
        console.error('useProfile update:', e);
      }
    },
    [userId],
  );

  const dailyGoalG = profile.goalOverrideG ?? calculateGoal(profile.weightKg, profile.activityLevel, profile.goalType);

  return { profile, update, dailyGoalG, profileLoading: loading };
}
