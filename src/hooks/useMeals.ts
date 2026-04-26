import { useCallback, useEffect, useState } from 'react';
import { deleteMeal, listMeals, upsertMeal } from '../lib/db';
import type { Meal } from '../types';

export function useMeals(userId: string | null) {
  const [meals, setMeals] = useState<Meal[]>([]);

  const load = useCallback(async () => {
    try {
      const list = await listMeals();
      setMeals(list);
    } catch (e) {
      console.error('useMeals load:', e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addMeal = useCallback(
    async (meal: Meal) => {
      if (!userId) return;
      setMeals((prev) => [meal, ...prev]);
      try {
        await upsertMeal(userId, meal);
      } catch (e) {
        console.error('useMeals addMeal:', e);
        setMeals((prev) => prev.filter((m) => m.id !== meal.id));
      }
    },
    [userId],
  );

  const updateMeal = useCallback(
    async (id: string, patch: Partial<Meal>) => {
      if (!userId) return;
      const merged = { ...meals.find((m) => m.id === id)!, ...patch, id };
      setMeals((prev) => prev.map((m) => (m.id === id ? merged : m)));
      try {
        await upsertMeal(userId, merged);
      } catch (e) {
        console.error('useMeals updateMeal:', e);
      }
    },
    [meals, userId],
  );

  const removeMeal = useCallback(async (id: string) => {
    const prev = meals;
    setMeals((p) => p.filter((m) => m.id !== id));
    try {
      await deleteMeal(id);
    } catch (e) {
      console.error('useMeals removeMeal:', e);
      setMeals(prev);
    }
  }, [meals]);

  const findMeal = useCallback((id: string) => meals.find((m) => m.id === id), [meals]);

  return { meals, addMeal, updateMeal, removeMeal, findMeal };
}
