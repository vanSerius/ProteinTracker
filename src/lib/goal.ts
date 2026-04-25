export type ActivityLevel = 'sedentary' | 'light' | 'active' | 'very_active';
export type GoalType = 'maintain' | 'lose_fat' | 'build_muscle';
export type WeightUnit = 'kg' | 'lb';

export function lbToKg(lb: number): number {
  return lb * 0.45359237;
}

export function kgToLb(kg: number): number {
  return kg / 0.45359237;
}

/**
 * Returns g protein per kg body weight based on activity level and goal.
 * Multipliers reflect mainstream sports-nutrition guidance (ISSN, ACSM).
 */
export function multiplier(activity: ActivityLevel, goal: GoalType): number {
  if (goal === 'build_muscle') {
    if (activity === 'very_active') return 2.2;
    if (activity === 'active') return 2.0;
    if (activity === 'light') return 1.8;
    return 1.6;
  }
  if (goal === 'lose_fat') {
    if (activity === 'very_active') return 2.0;
    if (activity === 'active') return 1.8;
    if (activity === 'light') return 1.6;
    return 1.4;
  }
  if (activity === 'very_active') return 1.8;
  if (activity === 'active') return 1.6;
  if (activity === 'light') return 1.2;
  return 0.8;
}

export function calculateGoal(weightKg: number, activity: ActivityLevel, goal: GoalType): number {
  const grams = weightKg * multiplier(activity, goal);
  return Math.round(grams / 5) * 5;
}
