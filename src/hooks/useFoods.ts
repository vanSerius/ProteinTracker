import { useCallback, useEffect, useMemo, useState } from 'react';
import builtIn from '../data/foods.json';
import { KEYS, load, save } from '../lib/storage';
import type { Food } from '../types';

const BUILT_IN: Food[] = builtIn as Food[];

export function useFoods() {
  const [customFoods, setCustomFoods] = useState<Food[]>(() => load<Food[]>(KEYS.customFoods, []));
  const [favorites, setFavorites] = useState<string[]>(() => load<string[]>(KEYS.favorites, []));

  useEffect(() => save(KEYS.customFoods, customFoods), [customFoods]);
  useEffect(() => save(KEYS.favorites, favorites), [favorites]);

  const allFoods = useMemo<Food[]>(() => [...BUILT_IN, ...customFoods], [customFoods]);

  const findFood = useCallback(
    (id: string) => allFoods.find((f) => f.id === id),
    [allFoods],
  );

  const search = useCallback(
    (query: string): Food[] => {
      const q = query.trim().toLowerCase();
      if (!q) return allFoods;
      return allFoods.filter((f) => f.name.toLowerCase().includes(q));
    },
    [allFoods],
  );

  const addCustom = useCallback((food: Food) => {
    setCustomFoods((prev) => [...prev, food]);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const favoriteFoods = useMemo<Food[]>(
    () => favorites.map((id) => allFoods.find((f) => f.id === id)).filter(Boolean) as Food[],
    [favorites, allFoods],
  );

  return { allFoods, customFoods, favoriteFoods, findFood, search, addCustom, toggleFavorite, isFavorite };
}
