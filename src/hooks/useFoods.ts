import { useCallback, useEffect, useMemo, useState } from 'react';
import builtIn from '../data/foods.json';
import {
  addFavorite as dbAddFavorite,
  insertCustomFood,
  listCustomFoods,
  listFavorites,
  removeFavorite as dbRemoveFavorite,
} from '../lib/db';
import type { Food } from '../types';

const BUILT_IN: Food[] = builtIn as Food[];

export function useFoods(userId: string | null) {
  const [customFoods, setCustomFoods] = useState<Food[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadCustom = useCallback(async () => {
    try {
      const list = await listCustomFoods();
      setCustomFoods(list);
    } catch (e) {
      console.error('useFoods loadCustom:', e);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!userId) return;
    try {
      const ids = await listFavorites(userId);
      setFavorites(ids);
    } catch (e) {
      console.error('useFoods loadFavorites:', e);
    }
  }, [userId]);

  useEffect(() => {
    loadCustom();
  }, [loadCustom]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const allFoods = useMemo<Food[]>(() => [...BUILT_IN, ...customFoods], [customFoods]);

  const findFood = useCallback((id: string) => allFoods.find((f) => f.id === id), [allFoods]);

  const search = useCallback(
    (query: string): Food[] => {
      const q = query.trim().toLowerCase();
      if (!q) return allFoods;
      return allFoods.filter((f) => f.name.toLowerCase().includes(q));
    },
    [allFoods],
  );

  const addCustom = useCallback(
    async (food: Food) => {
      if (!userId) return;
      setCustomFoods((prev) => [food, ...prev]);
      try {
        await insertCustomFood(userId, food);
      } catch (e) {
        console.error('useFoods addCustom:', e);
        setCustomFoods((prev) => prev.filter((f) => f.id !== food.id));
      }
    },
    [userId],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      if (!userId) return;
      const isFav = favorites.includes(id);
      setFavorites((prev) => (isFav ? prev.filter((f) => f !== id) : [...prev, id]));
      try {
        if (isFav) await dbRemoveFavorite(userId, id);
        else await dbAddFavorite(userId, id);
      } catch (e) {
        console.error('useFoods toggleFavorite:', e);
        setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)));
      }
    },
    [favorites, userId],
  );

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const favoriteFoods = useMemo<Food[]>(
    () => favorites.map((id) => allFoods.find((f) => f.id === id)).filter(Boolean) as Food[],
    [favorites, allFoods],
  );

  return { allFoods, customFoods, favoriteFoods, findFood, search, addCustom, toggleFavorite, isFavorite };
}
