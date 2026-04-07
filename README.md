# District Insight

DistrictInsight is a school district evaluation platform built for the AI Schools Workshop challenge. It helps parents and educators compare public school districts in the United States using publicly available data and easy-to-understand scoring.

The application lives in [`district-insight/`](./district-insight/).

## What This Project Is About

Choosing a school district is hard because data is scattered, technical, and often hard to compare. DistrictInsight brings key signals into one place and turns complex district metrics into clear insights.

### Core Questions This App Answers

- Is this district good for my kid?
- How do districts compare side by side?
- Can I trust this district to live here long-term?
- What are student test score trends?
- Where does district funding go?
- How diverse is the student body?
- Is this a strong place to teach?

## Target Users

- Parents evaluating where to live and enroll children
- Teachers evaluating where to apply for jobs
- Families relocating between districts
- Anyone interested in public district performance data

## How DistrictInsight Evaluates Districts

DistrictInsight combines multiple district-level indicators into understandable category scores and an overall grade-style summary (A–F).

### Evaluation dimensions

- **Academics (40%)** — proficiency and assessment signals
- **Funding (25%)** — per-pupil spending and revenue mix
- **Environment (20%)** — enrollment scale and student–teacher ratio
- **Equity (15%)** — context such as poverty and outcome spread where data allows

## Data source

The app uses the [Urban Institute Education Data Portal](https://educationdata.urban.org/api/) (no API key required).

Base API: `https://educationdata.urban.org/api/`

Useful endpoint patterns:

- District directory: `v1/school-districts/ccd/directory/{year}/`
- Enrollment: `v1/school-districts/ccd/enrollment/{year}/`
- Finance: `v1/school-districts/ccd/finance/{year}/`
- Test scores: `v1/school-districts/edfacts/assessments/{year}/`

## Tech stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Charts:** Recharts
- **Testing:** Vitest, React Testing Library, `@testing-library/user-event`, coverage via `@vitest/coverage-v8`
- **Deployment:** [Vercel](https://vercel.com/) (static build; `vercel.json` rewrites client routes to `index.html`)

## Workshop goals

This project satisfies the requirements in [instructions.md](./instructions.md):

- Runnable software product
- Heavy use of generative AI in ideation, implementation, and testing
- Strong automated testing with coverage thresholds enforced in Vitest
- Deployable product for end users on Vercel

## Local development

From the app directory:

```bash
cd district-insight
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

### Other commands

| Command | Purpose |
|--------|--------|
| `npm run build` | Typecheck and production build to `district-insight/dist` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | ESLint |

## Deploy to Vercel

1. Log in (one time): `npx vercel login`
2. From `district-insight`: `npx vercel --prod --yes`

The CLI will detect Vite, use `dist` as output, and apply SPA rewrites from [`district-insight/vercel.json`](./district-insight/vercel.json). You can also connect this Git repository in the Vercel dashboard and set the **Root Directory** to `district-insight`.

## Repository layout

| Path | Contents |
|------|----------|
| [README.md](./README.md) | This overview |
| [instructions.md](./instructions.md) | Workshop challenge requirements |
| [LICENSE.md](./LICENSE.md) | License |
| [district-insight/](./district-insight/) | Application source, tests, and Vercel config |

## Team

- [Antonio Jackson](https://github.com/antoniojacksnn)
- [Angelina Wu](https://github.com/TangelinaWu)
- [Chinwe Otti](https://github.com/chinweot)
- [Liam Stewart](https://github.com/lcs493atnyu)
- [Lily Luo](https://github.com/lilyluo7412)
