export type OffProduct = {
  barcode: string;
  name: string;
  brand?: string;
  proteinPer100g: number;
  imageUrl?: string;
  /** Grams of one labeled serving, if Open Food Facts has it (e.g. "1 tortilla (45 g)" → 45). */
  servingGrams?: number;
  /** Free-text serving label as printed on the package, when meaningful (e.g. "1 slice"). */
  servingLabel?: string;
  /** Total grams of the whole package (for fraction-of-pack picking). */
  packageGrams?: number;
  /** OFF category tags, useful for guessing the natural unit (slice, spoon, piece). */
  categoryTags?: string[];
};

const ENDPOINT = (code: string) =>
  `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments,image_small_url,serving_size,serving_quantity,product_quantity,quantity,categories_tags`;

type OffApiResponse = {
  status: number;
  product?: {
    product_name?: string;
    brands?: string;
    image_small_url?: string;
    serving_size?: string;
    serving_quantity?: number | string;
    product_quantity?: number | string;
    quantity?: string;
    categories_tags?: string[];
    nutriments?: {
      proteins_100g?: number;
    };
  };
};

function parseNum(v: number | string | undefined): number | undefined {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    if (isFinite(n)) return n;
  }
  return undefined;
}

function parseServingLabel(s: string | undefined): string | undefined {
  if (!s) return undefined;
  const trimmed = s.trim();
  if (!trimmed) return undefined;
  // Strip trailing "(45g)" / "(45 g)" so we keep only the human-readable noun.
  return trimmed.replace(/\s*\(.*?\)\s*$/, '').trim() || undefined;
}

export async function lookupBarcode(code: string): Promise<OffProduct | null> {
  const resp = await fetch(ENDPOINT(code), {
    headers: { Accept: 'application/json' },
  });
  if (!resp.ok) return null;
  const data = (await resp.json()) as OffApiResponse;
  if (data.status !== 1 || !data.product) return null;
  const protein = data.product.nutriments?.proteins_100g;
  if (typeof protein !== 'number') return null;
  return {
    barcode: code,
    name: data.product.product_name?.trim() || `Product ${code}`,
    brand: data.product.brands?.split(',')[0]?.trim(),
    proteinPer100g: Math.round(protein * 10) / 10,
    imageUrl: data.product.image_small_url,
    servingGrams: parseNum(data.product.serving_quantity),
    servingLabel: parseServingLabel(data.product.serving_size),
    packageGrams: parseNum(data.product.product_quantity),
    categoryTags: data.product.categories_tags,
  };
}
