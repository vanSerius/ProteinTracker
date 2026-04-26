/**
 * Cloudflare Worker: proxies image-analysis requests to Google Gemini Flash.
 * Keeps the Gemini API key in Worker secrets (never exposed to the browser).
 *
 * POST /analyze   { image: "data:image/jpeg;base64,...", hint?: string }
 *   → { items: [{name, estimatedGrams, proteinG, confidence}], totalProteinG, summary }
 *
 * GET /          → simple health check
 */

export interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGIN?: string;
}

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const PROMPT = `You are a sports-nutrition food analyst. Look at this photo of food.
Identify each distinct food item visible. For each, estimate:
- name (concise, English, like "grilled chicken breast" or "white rice")
- estimatedGrams (integer, your best guess of the cooked weight on the plate)
- proteinG (integer grams of protein in that portion, using standard nutrition values)
- confidence ("high", "medium", or "low")

Respond ONLY with strict JSON in this exact shape, no markdown, no commentary:
{
  "items": [
    { "name": "...", "estimatedGrams": 0, "proteinG": 0, "confidence": "high" }
  ],
  "totalProteinG": 0,
  "summary": "one short sentence about the meal"
}`;

function corsHeaders(origin: string | null, allowed?: string): HeadersInit {
  const allow = allowed && allowed !== '*' ? allowed : '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
    ...(origin ? {} : {}),
  };
}

function json(data: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function stripDataUrl(image: string): { mime: string; data: string } {
  const m = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(image);
  if (m) return { mime: m[1], data: m[2] };
  return { mime: 'image/jpeg', data: image };
}

function safeParse(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  return JSON.parse(trimmed);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return json({ status: 'ok', model: GEMINI_MODEL }, 200, cors);
    }

    if (request.method !== 'POST' || url.pathname !== '/analyze') {
      return json({ error: 'Not found' }, 404, cors);
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: 'Worker not configured: GEMINI_API_KEY missing' }, 500, cors);
    }

    let body: { image?: string; hint?: string };
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, cors);
    }

    if (!body.image) {
      return json({ error: 'Missing "image" field' }, 400, cors);
    }

    const { mime, data } = stripDataUrl(body.image);
    const promptText = body.hint ? `${PROMPT}\n\nUser hint: ${body.hint}` : PROMPT;

    const geminiResp = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: promptText },
              { inlineData: { mimeType: mime, data } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      return json({ error: 'Gemini call failed', status: geminiResp.status, detail: errText }, 502, cors);
    }

    const geminiJson = await geminiResp.json<{
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    }>();

    const text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!text) {
      return json({ error: 'Gemini returned no content', raw: geminiJson }, 502, cors);
    }

    let parsed: unknown;
    try {
      parsed = safeParse(text);
    } catch (e) {
      return json({ error: 'Gemini returned invalid JSON', raw: text }, 502, cors);
    }

    return json(parsed, 200, cors);
  },
};
