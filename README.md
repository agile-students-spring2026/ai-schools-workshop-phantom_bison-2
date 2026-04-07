# DistrictInsight

DistrictInsight is a school district evaluation platform built for the AI Schools Workshop challenge. It helps parents and educators compare public school districts in the United States using publicly available data and easy-to-understand scoring.

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

DistrictInsight combines multiple district-level indicators into understandable category scores and an overall grade-style summary.

### Example Evaluation Dimensions

- Academic outcomes (proficiency and growth trends)
- Funding and spending priorities
- Student demographics and diversity profile
- Teacher-focused signals (salary and student-teacher ratio)
- Stability and enrollment trends over time

## Data Source

The platform uses the Urban Institute Education Data Portal (no API key required).

Base API:

- https://educationdata.urban.org/api/

Useful endpoint patterns:

- District directory: `v1/school-districts/ccd/directory/{year}/`
- Enrollment: `v1/school-districts/ccd/enrollment/{year}/`
- Finance: `v1/school-districts/ccd/finance/{year}/`
- Test scores: `v1/school-districts/edfacts/assessments/{year}/`

## Proposed Tech Stack

- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS
- Routing: React Router 6
- Charts: Recharts
- Testing: Vitest + React Testing Library + user-event
- Deployment: Vercel

## Workshop Goals

This project is designed to satisfy the workshop requirements in [instructions.md](./instructions.md):

- Build a runnable software product in one class session
- Use generative AI heavily during ideation, implementation, and testing
- Achieve thorough unit testing with a 100% code coverage target
- Deploy a usable product for end users by end of session

## Current Status

This repository currently includes workshop planning and project framing. Implementation tasks should focus on:

- Defining the district scoring model
- Building district search and comparison views
- Integrating Urban Institute endpoints
- Implementing chart-based insights and trend views
- Adding complete automated tests
- Deploying the final application

## Project Structure

- [README.md](./README.md): Project overview and setup context
- [instructions.md](./instructions.md): Workshop challenge requirements
- [LICENSE.md](./LICENSE.md): License information

## Next Steps

1. Scaffold the React + TypeScript + Vite app
2. Add API service layer for district data
3. Build comparison and scoring UI
4. Add full unit and component test coverage
5. Deploy to Vercel and validate production behavior
