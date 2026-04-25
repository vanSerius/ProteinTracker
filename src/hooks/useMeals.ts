import { useCallback, useEffect, useState } from 'react';
import { KEYS, load, save } from '../lib/storage';
import type { Meal } from '../types';

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>(() => load<Meal[]>(KEYS.meals, []));

  useEffect(() => {
    save(KEYS.meals, meals);
  }, [meals]);

  const addMeal = useCallback((meal: Meal) => {
    setMeals((prev) => [...prev, meal]);
  }, []);

  const updateMeal = useCallback((id: string, patch: Partial<Meal>) => {
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const removeMeal = useCallback((id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const findMeal = useCallback((id: string) => meals.find((m) => m.id === id), [meals]);

  return { meals, addMeal, updateMeal, removeMeal, findMeal };
}
