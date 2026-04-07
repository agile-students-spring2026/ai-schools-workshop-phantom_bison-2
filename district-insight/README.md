# DistrictInsight

Client-side web app for exploring and comparing U.S. public school districts using the Urban Institute Education Data Portal API.

## Features

- **Home** — State picker and entry into search
- **Search** — Filter and sort districts; add up to three for comparison
- **District detail** — Scorecard, tabs for academics, funding, enrollment, and educator-oriented metrics
- **Compare** — Side-by-side grid for selected districts
- **For teachers** — View focused on salary, ratios, and related signals
- **Charts** — Enrollment, finance (revenue), and proficiency visualizations (Recharts)

## Prerequisites

- Node.js 20+ (recommended)

## Setup

```bash
npm install
```

## Scripts

```bash
npm run dev          # Development server (Vite)
npm run build        # tsc -b && vite build → dist/
npm run preview      # Preview production build
npm test             # Vitest (single run)
npm run test:watch   # Vitest watch mode
npm run test:coverage # Coverage (thresholds in vite.config.ts)
npm run lint         # ESLint
```

## Environment

No API keys are required. The app calls `https://educationdata.urban.org/api/` from the browser.

## Deployment (Vercel)

Project includes `vercel.json` with SPA rewrites so React Router paths work in production.

```bash
npx vercel login    # once
npx vercel --prod --yes
```

In the Vercel dashboard, if this repo is the root of a monorepo-style layout, set **Root Directory** to `district-insight`.

## Project structure (high level)

- `src/pages/` — Routed screens
- `src/components/` — UI, layout, charts
- `src/hooks/` — Data fetching and compare state
- `src/api/` — HTTP helpers and endpoint URLs
- `src/utils/` — Scoring, formatting, constants, state metadata
- `src/__tests__/` — Vitest + Testing Library
