# Protein Tracker

Mobile-first PWA for tracking daily protein intake. Built for athletes who want a simple "did I eat enough protein today?" answer in one glance.

## Features

- **Today**: large progress ring showing current vs daily goal, with quick-add and entry list.
- **Add food**: ~50 built-in foods (meat, fish, dairy, plant, shakes), custom favorites, search.
- **Three portion modes**: exact grams, common servings, or **visual size estimator** (XS/S/M/L/XL with everyday comparisons like "deck of cards" or "palm of hand") — for restaurant meals where you don't know grams.
- **My meals**: build a recipe (e.g. stuffed peppers with ground meat) once, log it later in a single tap.
- **History**: 7/30-day bar chart, average, days hit goal, current streak.
- **Profile**: weight (kg/lb), activity level, goal type — auto-computes daily target with override.
- **PWA**: installable on iPhone/Android home screen, works offline.
- **No accounts, no backend** — all data stays on the device in `localStorage`.

## Stack

Vite · React 18 · TypeScript · Tailwind · react-router · vite-plugin-pwa · Vitest.

## Develop

```sh
npm install
npm run dev          # local dev (use --host to test on phone via LAN)
npm test             # unit tests for goal calculation + helpers
npm run build        # production build to ./dist
```

## Deploy

Push to `main` — GitHub Actions builds and deploys to GitHub Pages automatically.

In your GitHub repo settings: **Pages → Source → GitHub Actions**.

The site will be live at `https://<user>.github.io/ProteinTracker/`.

## Goal calculation

Daily protein target = body weight (kg) × multiplier:

| Activity × Goal | Multiplier (g/kg) |
|---|---|
| Sedentary, maintain | 0.8 |
| Active, maintain | 1.6 |
| Active, lose fat | 1.8 |
| Active, build muscle | 2.0 |
| Very active, build muscle | 2.2 |

Rounded to the nearest 5 g. Override available in Profile.
