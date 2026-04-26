import { supabase } from './supabase';
import type { Entry, Food, Meal } from '../types';
import type { DbEntry, DbCustomFood, DbMeal, DbUser } from './db.types';

// supabase-js client is intentionally untyped (see supabase.ts). API
// wrappers below carry the public types so call sites stay typed.

// ─── Users ─────────────────────────────────────────────────────────────────

export async function listUsers(): Promise<DbUser[]> {
  const { data, error } = await supabase.from('users').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getUser(id: string): Promise<DbUser | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateUser(id: string, patch: Partial<DbUser>): Promise<DbUser> {
  const { data, error } = await supabase.from('users').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

// ─── Entries ───────────────────────────────────────────────────────────────

export async function listEntriesForUser(userId: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp_ms', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToEntry);
}

export async function insertEntry(userId: string, entry: Entry): Promise<Entry> {
  const row: DbEntry = {
    id: entry.id,
    user_id: userId,
    date_iso: entry.dateISO,
    food_id: entry.foodId ?? null,
    meal_id: null,
    custom_name: entry.customName ?? null,
    grams: entry.grams,
    protein_g: entry.proteinG,
    source: entry.source ?? null,
    timestamp_ms: entry.timestamp,
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('entries').insert(row);
  if (error) throw error;
  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) throw error;
}

function rowToEntry(r: DbEntry): Entry {
  return {
    id: r.id,
    dateISO: r.date_iso,
    foodId: r.food_id ?? undefined,
    customName: r.custom_name ?? undefined,
    grams: Number(r.grams),
    proteinG: Number(r.protein_g),
    timestamp: Number(r.timestamp_ms),
    source: (r.source ?? undefined) as Entry['source'],
  };
}

// ─── Custom foods (shared) ─────────────────────────────────────────────────

export async function listCustomFoods(): Promise<Food[]> {
  const { data, error } = await supabase.from('custom_foods').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToFood);
}

export async function insertCustomFood(userId: string, food: Food): Promise<Food> {
  const row: DbCustomFood = {
    id: food.id,
    name: food.name,
    protein_per_100g: food.proteinPer100g,
    category: food.category,
    created_by: userId,
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('custom_foods').insert(row);
  if (error) throw error;
  return food;
}

function rowToFood(r: DbCustomFood): Food {
  return {
    id: r.id,
    name: r.name,
    proteinPer100g: Number(r.protein_per_100g),
    category: (r.category ?? 'other') as Food['category'],
    custom: true,
  };
}

// ─── Meals (shared) ────────────────────────────────────────────────────────

export async function listMeals(): Promise<Meal[]> {
  const { data, error } = await supabase.from('meals').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToMeal);
}

export async function upsertMeal(userId: string, meal: Meal): Promise<Meal> {
  const row: DbMeal = {
    id: meal.id,
    name: meal.name,
    ingredients: meal.ingredients,
    servings: meal.servings,
    total_protein_g: meal.totalProteinG,
    created_by: userId,
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('meals').upsert(row);
  if (error) throw error;
  return meal;
}

export async function deleteMeal(id: string): Promise<void> {
  const { error } = await supabase.from('meals').delete().eq('id', id);
  if (error) throw error;
}

function rowToMeal(r: DbMeal): Meal {
  return {
    id: r.id,
    name: r.name,
    ingredients: r.ingredients,
    servings: r.servings,
    totalProteinG: Number(r.total_protein_g),
  };
}

// ─── Favorites (per user) ──────────────────────────────────────────────────

export async function listFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('food_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.food_id);
}

export async function addFavorite(userId: string, foodId: string): Promise<void> {
  const { error } = await supabase.from('favorites').insert({ user_id: userId, food_id: foodId });
  if (error) throw error;
}

export async function removeFavorite(userId: string, foodId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('food_id', foodId);
  if (error) throw error;
}
