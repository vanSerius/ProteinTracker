# Protein Tracker — Worker

Cloudflare Worker that proxies image-analysis requests from the PWA to Google Gemini Flash. The Gemini API key lives only here as a Worker secret — it is never sent to the browser or committed to git.

## What you need (10 min, one-time, both free)

1. **Google AI Studio** account (no credit card): https://aistudio.google.com → "Get API key" → copy it.
   - Free tier as of 2025: Gemini 2.0 Flash = 1,500 requests/day, 1M tokens/min. Personal use never gets close.
2. **Cloudflare** account (no credit card): https://workers.cloudflare.com → sign up.

## Deploy

```sh
cd worker
npm install
npx wrangler login                          # opens browser, log in to Cloudflare
npx wrangler secret put GEMINI_API_KEY      # paste the Gemini key when prompted
npx wrangler deploy
```

The last command prints a URL like:

```
https://protein-tracker-worker.<your-subdomain>.workers.dev
```

Copy that URL.

## Wire it into the app

Open the PWA → **Profile** → **Photo recognition** → paste the Worker URL → Save.

That's it. The 📷 button in **Add food** is now active.

## Test the worker directly (optional)

```sh
curl https://<your-worker>.workers.dev/                # health check
curl -X POST https://<your-worker>.workers.dev/analyze \
  -H 'Content-Type: application/json' \
  -d '{"image":"data:image/jpeg;base64,..."}'           # returns analysis JSON
```

## Lock down CORS (optional)

By default the worker accepts requests from any origin. To restrict to your GitHub Pages origin only, edit `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGIN = "https://vanserius.github.io"
```

Then `npx wrangler deploy` again.

## Privacy note

Gemini's free tier states submitted data may be used to improve their models. The PWA never persists the photo locally — it's sent to the Worker, forwarded to Gemini, then dropped. If that tradeoff is unacceptable for some images, your wife should just skip the camera button and log manually.

## Rotate / disable

```sh
npx wrangler secret put GEMINI_API_KEY        # paste a new key
npx wrangler delete                            # tear down the worker entirely
```
