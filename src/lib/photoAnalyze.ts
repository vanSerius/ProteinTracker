export type AnalyzedItem = {
  name: string;
  estimatedGrams: number;
  proteinG: number;
  confidence?: 'high' | 'medium' | 'low';
};

export type AnalyzeResult = {
  items: AnalyzedItem[];
  totalProteinG?: number;
  summary?: string;
};

const MAX_DIM = 1024;
const JPEG_QUALITY = 0.8;

export async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

export async function analyzePhoto(workerUrl: string, file: File, hint?: string): Promise<AnalyzeResult> {
  const url = workerUrl.replace(/\/+$/, '') + '/analyze';
  const image = await compressImage(file);
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, hint }),
  });
  if (!resp.ok) {
    let detail = '';
    try {
      const j = await resp.json();
      detail = (j as { error?: string }).error ?? '';
    } catch {
      detail = await resp.text();
    }
    throw new Error(`Worker error (${resp.status}): ${detail}`);
  }
  const data = (await resp.json()) as AnalyzeResult;
  if (!Array.isArray(data.items)) throw new Error('Worker returned unexpected shape');
  return data;
}
