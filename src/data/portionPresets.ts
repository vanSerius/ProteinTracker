import type { Food, FoodCategory } from '../types';

export type SizeKey = 'XS' | 'S' | 'M' | 'L' | 'XL';

export type PortionPreset = {
  key: SizeKey;
  label: string;
  comparison: string;
  emoji: string;
  defaultGrams: number;
};

const meatLike: PortionPreset[] = [
  { key: 'XS', label: 'XS', comparison: 'matchbox / 2 fingers', emoji: '🤏', defaultGrams: 50 },
  { key: 'S', label: 'S', comparison: 'deck of cards / small palm', emoji: '🃏', defaultGrams: 100 },
  { key: 'M', label: 'M', comparison: 'palm of hand / smartphone', emoji: '📱', defaultGrams: 150 },
  { key: 'L', label: 'L', comparison: 'two palms / large schnitzel', emoji: '✋', defaultGrams: 220 },
  { key: 'XL', label: 'XL', comparison: 'big steak / restaurant chicken breast', emoji: '🍖', defaultGrams: 300 },
];

const dairyCup: PortionPreset[] = [
  { key: 'XS', label: 'XS', comparison: 'spoonful', emoji: '🥄', defaultGrams: 30 },
  { key: 'S', label: 'S', comparison: 'small cup', emoji: '🥛', defaultGrams: 100 },
  { key: 'M', label: 'M', comparison: 'standard cup', emoji: '🍶', defaultGrams: 150 },
  { key: 'L', label: 'L', comparison: 'large cup / bowl', emoji: '🥣', defaultGrams: 250 },
  { key: 'XL', label: 'XL', comparison: 'big bowl', emoji: '🍲', defaultGrams: 400 },
];

const grainPlate: PortionPreset[] = [
  { key: 'XS', label: 'XS', comparison: '1 spoon', emoji: '🥄', defaultGrams: 30 },
  { key: 'S', label: 'S', comparison: 'side dish', emoji: '🍽️', defaultGrams: 100 },
  { key: 'M', label: 'M', comparison: 'normal plate', emoji: '🍝', defaultGrams: 200 },
  { key: 'L', label: 'L', comparison: 'big plate', emoji: '🍛', defaultGrams: 300 },
  { key: 'XL', label: 'XL', comparison: 'huge restaurant plate', emoji: '🍱', defaultGrams: 400 },
];

const nutHandful: PortionPreset[] = [
  { key: 'XS', label: 'XS', comparison: 'few pieces', emoji: '🤏', defaultGrams: 10 },
  { key: 'S', label: 'S', comparison: 'small handful', emoji: '✋', defaultGrams: 20 },
  { key: 'M', label: 'M', comparison: 'handful', emoji: '🤲', defaultGrams: 30 },
  { key: 'L', label: 'L', comparison: 'big handful', emoji: '🥜', defaultGrams: 50 },
];

export function presetsForCategory(category: FoodCategory): PortionPreset[] {
  switch (category) {
    case 'meat':
    case 'fish':
    case 'restaurant':
      return meatLike;
    case 'dairy':
      return dairyCup;
    case 'plant':
      return dairyCup;
    case 'grain':
      return grainPlate;
    case 'nut':
      return nutHandful;
    case 'shake':
    case 'egg':
    case 'other':
    default:
      return meatLike;
  }
}

export function presetsForFood(food: Food): PortionPreset[] {
  const base = presetsForCategory(food.category);
  if (!food.visualSizes) return base;
  return base.map((p) => {
    const override = food.visualSizes?.[p.key];
    return override ? { ...p, defaultGrams: override } : p;
  });
}
