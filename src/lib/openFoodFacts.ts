export type OffProduct = {
  barcode: string;
  name: string;
  brand?: string;
  proteinPer100g: number;
  imageUrl?: string;
};

const ENDPOINT = (code: string) =>
  `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments,image_small_url`;

type OffApiResponse = {
  status: number;
  product?: {
    product_name?: string;
    brands?: string;
    image_small_url?: string;
    nutriments?: {
      proteins_100g?: number;
    };
  };
};

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
  };
}
