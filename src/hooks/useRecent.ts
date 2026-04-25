import { useMemo } from 'react';
import type { Entry, Food } from '../types';

export function useRecent(entries: Entry[], allFoods: Food[], limit = 8): Food[] {
  return useMemo(() => {
    const seen = new Set<string>();
    const result: Food[] = [];
    const byTime = [...entries].sort((a, b) => b.timestamp - a.timestamp);
    for (const e of byTime) {
      if (!e.foodId || seen.has(e.foodId)) continue;
      const food = allFoods.find((f) => f.id === e.foodId);
      if (!food) continue;
      seen.add(e.foodId);
      result.push(food);
      if (result.length >= limit) break;
    }
    return result;
  }, [entries, allFoods, limit]);
}
