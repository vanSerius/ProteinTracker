import type { OffProduct } from './openFoodFacts';

export type UnitHint = {
  /** Primary unit shown first (e.g. "slice" for cheese). */
  unit: 'piece' | 'slice' | 'spoon' | 'cup';
  /** Localized noun used in the UI. */
  label: string;
  /** Default grams for one of these units. */
  defaultGrams: number;
  /** Emoji icon for the tab. */
  emoji: string;
};

const RULES: Array<{ test: RegExp; hint: UnitHint }> = [
  // Sliceable cheese / cold cuts / bread → SLICE
  {
    test: /(gouda|cheddar|edamer|emmental|mozzarella|tilsiter|appenzeller|gruy[eè]re|parmesan|feta|sliced cheese|k[aä]se.*scheib|wurst|salami|schinken|ham|bacon|brot|toast|baguette|pumpernickel|bread)/i,
    hint: { unit: 'slice', label: 'Scheiben', defaultGrams: 20, emoji: '🍞' },
  },
  // Spoonable dairy / spreads → SPOON (tablespoon ≈ 15 g)
  {
    test: /(yogh?urt|jogh?urt|joghurt|quark|skyr|pudding|kefir|frischk[aä]se|curd|hummus|peanut.*butter|erdnussmus|mandelmus|nutella|nuss-?nougat|jam|marmel|honig|honey|mayo|sour.*cream)/i,
    hint: { unit: 'spoon', label: 'Esslöffel', defaultGrams: 15, emoji: '🥄' },
  },
  // Drinkable → CUP (cup ≈ 250 ml/g)
  {
    test: /(milk|milch|drink|getr[aä]nk|juice|saft|smoothie|kakao|cocoa|shake|kefir.*drink|protein.*drink)/i,
    hint: { unit: 'cup', label: 'Glas', defaultGrams: 250, emoji: '🥛' },
  },
  // Discrete pieces (bars, biscuits, tortillas, eggs)
  {
    test: /(bar|riegel|biscuit|cookie|keks|tortilla|wrap|cracker|chip|nugget|patty|filet|burger|fish.*finger|fischst[aä]bchen|sausage|w[uü]rstchen|egg|ei)/i,
    hint: { unit: 'piece', label: 'Stück', defaultGrams: 50, emoji: '🍪' },
  },
];

const TAG_RULES: Array<{ tag: RegExp; hint: UnitHint }> = [
  { tag: /cheeses?$/i, hint: { unit: 'slice', label: 'Scheiben', defaultGrams: 20, emoji: '🧀' } },
  { tag: /breads?$/i, hint: { unit: 'slice', label: 'Scheiben', defaultGrams: 40, emoji: '🍞' } },
  { tag: /yogurts?$/i, hint: { unit: 'spoon', label: 'Esslöffel', defaultGrams: 15, emoji: '🥄' } },
  { tag: /milks?$/i, hint: { unit: 'cup', label: 'Glas', defaultGrams: 250, emoji: '🥛' } },
];

export function inferUnit(product: OffProduct): UnitHint {
  const name = `${product.name} ${product.brand ?? ''}`;
  for (const r of RULES) if (r.test.test(name)) return overrideWithServing(r.hint, product);

  const tags = product.categoryTags ?? [];
  for (const r of TAG_RULES) if (tags.some((t) => r.tag.test(t))) return overrideWithServing(r.hint, product);

  // Default
  return overrideWithServing({ unit: 'piece', label: 'Stück', defaultGrams: 50, emoji: '📦' }, product);
}

/** If Open Food Facts knows a serving weight, prefer it over our heuristic default. */
function overrideWithServing(hint: UnitHint, product: OffProduct): UnitHint {
  if (product.servingGrams && product.servingGrams > 0 && product.servingGrams < 1000) {
    return { ...hint, defaultGrams: Math.round(product.servingGrams) };
  }
  return hint;
}
