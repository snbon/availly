# Implementation Method — myfreeslots

## Guiding Principles
- Build the smallest lovable product that fully solves the "share availability politely" problem.
- Favor clarity and reliability over feature breadth.
- Prioritise clean code and structure.
- Every PR should tie back to the **mission** and **MVP acceptance criteria**.

## Branching & Commit Strategy
- Default branch: `dev`
- Feature branches: `feat/<short-kebab-summary>`
- Fix branches: `fix/<short-kebab-summary>`
- Conventional Commits:
  - new feature = new branch
- Rebase or squash-merge PRs;.

## PR Process (always)
1. Ensure repo remote is set and branch is pushed.
2. Write a clear description referencing the MVP/mission.
3. Include screenshots or local recordings for UI.
4. Add/adjust tests.
5. Pass CI: lint, type checks, unit/integration tests.
6. Self-review checklist:
   - Does this change align with MVP scope?
   - Are non-goals still preserved (no booking, no PII)?
   - Are timezones/DST handled where relevant?
   - Have you added docs or updated `MVP.md` if the behavior changed?

## Coding Standards
- **Frontend**: React + Vite, TypeScript preferred. ESLint + Prettier.
- **Backend**: Laravel + PHP 8.3+, Laravel Pint for code style.
- **DB**: PostgreSQL schema via Laravel migrations; seed minimal dev data.
- **Monorepo**: `/apps/api` (Laravel), `/apps/web` (React), `/packages/*` for shared types if needed.

## Dev Environments
- **Local DB**: Supabase (Postgres). Configure `.env` for API + Web.
supabase project url :
@https://xexdphhqptoknflxhibs.supabase.co 
api supabase key : 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhleGRwaGhxcHRva25mbHhoaWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3ODQwNTksImV4cCI6MjA3MTM2MDA1OX0.KjYsdGEBvk3YFjVhqUZeUxNlOhq_MGEr-okJiHDqexA


- **Prod**: Railway (API + Postgres + Redis). Use env vars, not committed secrets.
- **Webhooks**: Use a tunnel (e.g., ngrok) for local webhook testing.

## Calendar Sync
- Google: OAuth2 + Calendar API (readonly), push notifications; fallback incremental sync.
- Microsoft: Graph API (Calendars.Read), subscriptions/webhooks; fallback delta/polling.
- Apple: ICS (private calendar URLs or CalDAV app password). Poll ~10 min with ETag/Last-Modified.

## Testing Strategy
- API: Pest/PHPUnit for controllers/services; time-zone boundary tests.
- Web: Vitest + React Testing Library; hover tooltip behavior; timezone rendering.
- End-to-end: Playwright or Cypress on the public link and dashboard flows.

## Release & Ops
- GitHub Actions:
  - `ci.yml`: lint + test on PR
  - `deploy.yml`: deploy on `main` to Railway
- Migrations auto-run on deploy.
- Observability: basic request logs and error reporting (e.g., Laravel Telescope disabled in prod).

## Before Each New Request
- Re-read **Mission**, **Non-Goals**, and **Acceptance Criteria**.
- Confirm the change doesn't break privacy or introduce booking.
