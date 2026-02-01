# LifeOS Monorepo

Production-oriented monorepo scaffold for LifeOS, built around Turborepo, Angular, and a Python API with DDD-aligned layers.

## Structure

- `apps/web`: Angular frontend (standalone components, feature-first organization)
- `apps/api`: Python API (domain / application / infrastructure / interfaces)
- `packages/configs`: Shared lint/format/TS config

## Local development

1. Copy environment defaults:
   - `cp .env.example .env`
2. Install JS dependencies at repo root and in the web app:
   - `npm install`
   - `cd apps/web && npm install`
3. Start the stack with Docker:
   - `docker compose up --build`

## CI/CD

Azure Pipelines runs `lint`, `format`, `test`, `build`, and Docker image packaging. Deploy is gated behind the `Deploy` variable and main branch merges.

## Notes

- Lockfiles are enforced in CI via `scripts/verify-lockfiles.sh`. Generate `package-lock.json` (or pnpm/yarn lockfiles) before running CI.
- The Angular app and Python API are minimal shells awaiting product requirements.
- Health domain currently supports weight tracking with a stubbed Garmin/Strava integration flow.
