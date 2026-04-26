import type { ActivityLevel, GoalType, WeightUnit } from './lib/goal';

export type Sex = 'female' | 'male' | 'other';

export type Profile = {
  weightKg: number;
  weightUnit: WeightUnit;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  goalOverrideG?: number;
  heightCm?: number;
  age?: number;
  sex?: Sex;
};

export type User = {
  id: string;
  name: string;
  profile: Profile;
  workerUrl?: string;
};

export type ServingPreset = {
  label: string;
  grams: number;
};

export type FoodCategory = 'meat' | 'fish' | 'dairy' | 'egg' | 'plant' | 'grain' | 'nut' | 'shake' | 'restaurant' | 'other';

export type Food = {
  id: string;
  name: string;
  proteinPer100g: number;
  category: FoodCategory;
  commonServings?: ServingPreset[];
  /** When set, the visual size picker uses these explicit grams instead of category defaults. */
  visualSizes?: { XS?: number; S?: number; M?: number; L?: number; XL?: number };
  custom?: boolean;
};

export type Entry = {
  id: string;
  dateISO: string;
  foodId?: string;
  customName?: string;
  grams: number;
  proteinG: number;
  timestamp: number;
  source?: 'food' | 'meal' | 'custom' | 'photo' | 'barcode';
};

export type MealIngredient = {
  foodId?: string;
  customName?: string;
  grams: number;
  proteinG: number;
};

export type Meal = {
  id: string;
  name: string;
  ingredients: MealIngredient[];
  servings: number;
  totalProteinG: number;
};
