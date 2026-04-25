import type { Food } from '../types';

export function proteinForFood(food: Food, grams: number): number {
  return (food.proteinPer100g * grams) / 100;
}

export function totalProtein(items: Array<{ proteinG: number }>): number {
  return items.reduce((acc, e) => acc + e.proteinG, 0);
}
