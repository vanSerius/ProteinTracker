// Hand-written DB types matching db/schema.sql.

import type { ActivityLevel, GoalType, WeightUnit } from './goal';

export type DbUser = {
  id: string;
  name: string;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  sex: 'female' | 'male' | 'other' | null;
  weight_unit: WeightUnit | null;
  activity_level: ActivityLevel | null;
  goal_type: GoalType | null;
  goal_override_g: number | null;
  worker_url: string | null;
  created_at: string;
  updated_at: string;
};

export type DbEntry = {
  id: string;
  user_id: string;
  date_iso: string;
  food_id: string | null;
  meal_id: string | null;
  custom_name: string | null;
  grams: number;
  protein_g: number;
  source: string | null;
  timestamp_ms: number;
  created_at: string;
};

export type DbCustomFood = {
  id: string;
  name: string;
  protein_per_100g: number;
  category: string | null;
  created_by: string | null;
  created_at: string;
};

export type DbMeal = {
  id: string;
  name: string;
  ingredients: Array<{
    foodId?: string;
    customName?: string;
    grams: number;
    proteinG: number;
  }>;
  servings: number;
  total_protein_g: number;
  created_by: string | null;
  created_at: string;
};

export type DbFavorite = {
  user_id: string;
  food_id: string;
};

export type Database = {
  public: {
    Tables: {
      users: { Row: DbUser; Insert: Partial<DbUser> & { name: string }; Update: Partial<DbUser> };
      entries: { Row: DbEntry; Insert: Omit<DbEntry, 'id' | 'created_at'> & { id?: string }; Update: Partial<DbEntry> };
      custom_foods: { Row: DbCustomFood; Insert: Omit<DbCustomFood, 'created_at'>; Update: Partial<DbCustomFood> };
      meals: { Row: DbMeal; Insert: Omit<DbMeal, 'id' | 'created_at'> & { id?: string }; Update: Partial<DbMeal> };
      favorites: { Row: DbFavorite; Insert: DbFavorite; Update: Partial<DbFavorite> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
