# CityLine

CityLine is a monorepo for urban mobility exploration with a Next.js frontend, an Express backend, shared domain types, and a local Prisma database. The project started as a transport discovery product and is now evolving into a structured data pipeline for real municipal and ferry transport information.

## Current Status

The project is still in development and not finished yet.

What is already in place:
- Next.js frontend for line browsing, schedules, direction switching, map visualization, favorites, and saved locations
- Express backend with auth, favorites, transport endpoints, Prisma integration, and fallback dataset support
- shared domain package for transport models, scheduling helpers, and ingestion contracts
- Prisma schema for transport lines, directions, stops, schedules, fares, route paths, and user data
- ingestion module that validates collected manifests, normalizes them into canonical datasets, and imports them into the database
- initial collected and normalized data for Sao Francisco do Sul, including Verdes Mares line manifests and ferry route data

What is being worked on right now:
- replacing purely manual seed maintenance with a repeatable ingestion flow
- consolidating real collected data into canonical normalized IDs
- preparing the transport catalog to scale city by city without changing the runtime architecture

## Overview

The project simulates a real mobility product for municipal, intermunicipal, and ferry transport. It supports public access to core transport data and unlocks richer location-based features for authenticated users.

Main capabilities:
- line search and filtering
- route directions for each line
- schedules by day type and direction
- map visualization with route path and stops
- favorites and saved locations
- operational boarding recommendation based on active direction and user location
- local fallback dataset plus Prisma-backed transport catalog

## Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Leaflet
- Backend: Express 4, TypeScript, Zod
- Database: Prisma + SQLite
- Testing: Vitest, Supertest, Testing Library
- Monorepo: npm workspaces

## Architecture Summary

The monorepo is split into three main parts:

- `apps/frontend`
  Next.js application, dashboard UI, hooks, transport services, map, schedule, and login screens.
- `apps/backend`
  Express API, Prisma access, transport repository/service layer, auth, favorites, validation, and ingestion.
- `packages/shared`
  Shared transport types, fallback dataset, ingestion examples, and reusable transport logic.

Current transport flow:

1. Transport data can start from local fallback files or collected manifests.
2. Collected manifests are validated and normalized into canonical datasets.
3. Normalized datasets are imported into Prisma.
4. Backend transport endpoints read primarily from Prisma.
5. If the database is unavailable or empty, the backend falls back to the local dataset.
6. Frontend uses list endpoints for browsing and direction endpoints for the detailed line experience.

## Main Folder Structure

```text
cityline-main/
|-- apps/
|   |-- backend/
|   |   |-- data/
|   |   |-- prisma/
|   |   `-- src/
|   `-- frontend/
|       |-- app/
|       |-- components/
|       |-- features/
|       |-- hooks/
|       |-- services/
|       `-- types/
|-- packages/
|   `-- shared/
|       `-- src/
|-- README.md
`-- package.json
```

## Database

The database keeps both user data and transport domain data.

Existing user-related models:
- `User`
- `Favorite`
- `SavedLocation`

Transport models:
- `TransportLine`
- `RouteDirection`
- `Stop`
- `LineStop`
- `Schedule`
- `Fare`
- `RoutePath`
- `StopTimePrediction`

The schema is designed for local SQLite today and can be migrated later to PostgreSQL with minimal domain changes.

## Data Strategy

CityLine no longer depends only on manual seed editing. The project now supports two complementary sources:

- fallback transport data for local resilience and quick startup
- collected manifests that can be normalized and imported into the canonical transport domain

Relevant inputs already present in the repository:
- `packages/shared/src/data/fallback-transport.ts`
- `apps/backend/data/collected/sao-francisco-do-sul/verdes-mares/line-0100.json`
- `apps/backend/data/collected/sao-francisco-do-sul/ferry/route-fb-01.partial.json`
- `apps/backend/data/normalized/sao-francisco-do-sul/`

Useful backend ingestion files:
- [schema.prisma](/c:/repositorios/Cityline-main/apps/backend/prisma/schema.prisma)
- [seed.ts](/c:/repositorios/Cityline-main/apps/backend/prisma/seed.ts)
- [ingestion-cli.ts](/c:/repositorios/Cityline-main/apps/backend/src/modules/ingestion/ingestion-cli.ts)
- [ingestion-normalizer.ts](/c:/repositorios/Cityline-main/apps/backend/src/modules/ingestion/ingestion-normalizer.ts)
- [ingestion-importer.ts](/c:/repositorios/Cityline-main/apps/backend/src/modules/ingestion/ingestion-importer.ts)
- [ID_STRATEGY.md](/c:/repositorios/Cityline-main/apps/backend/src/modules/ingestion/ID_STRATEGY.md)

## Public vs Authenticated Features

Public access:
- browse lines
- see schedules
- see fares
- inspect map and route shapes
- switch line directions

Authenticated access:
- save favorites
- save locations
- use real-time browser geolocation
- see the best boarding stop for the selected direction
- receive operational boarding recommendation based on walking time and next departure

## Operational Boarding Recommendation

For authenticated users with location enabled, the frontend computes a boarding recommendation for the active direction.

Heuristic:
- start with stops from the active direction
- calculate walking distance to each stop
- estimate walking time with a simple constant walking speed
- compare that walking time against the next departure in that direction
- prefer a stop that is both reachable and operationally useful
- fall back to the physically nearest stop when data is insufficient or no stop is viable

This keeps the behavior transparent, deterministic, and easy to explain without pretending there is live bus GPS.

## API Summary

Base URL:
- `http://localhost:4000/api`

Core endpoints:
- `GET /lines`
- `GET /lines/:id`
- `GET /schedules`
- `GET /search?q=...`
- `GET /map/lines`

Direction endpoints:
- `GET /lines/:id/directions`
- `GET /lines/:id/directions/:directionId/stops`
- `GET /lines/:id/directions/:directionId/schedules`
- `GET /lines/:id/directions/:directionId/path`

Auth and personalization:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /auth/locations`
- `POST /auth/locations`
- `GET /favorites`
- `POST /favorites`
- `DELETE /favorites/:id`

## Running Locally

Install dependencies:

```bash
npm install
```

Run both frontend and backend:

```bash
npm run dev
```

Run frontend only:

```bash
npm run dev:frontend
```

Run backend only:

```bash
npm run dev:backend
```

## Database and Ingestion Commands

Generate Prisma client:

```bash
npm run db:generate --workspace @cityline/backend
```

Sync schema to local database:

```bash
npm run db:push --workspace @cityline/backend
```

Create a local migration during development:

```bash
npm run db:migrate --workspace @cityline/backend
```

Seed transport data:

```bash
npm run db:seed --workspace @cityline/backend
```

Normalize collected manifests:

```bash
npm run ingestion:normalize --workspace @cityline/backend -- --input data/collected
```

Import normalized datasets:

```bash
npm run ingestion:import --workspace @cityline/backend -- --input data/normalized
```

Reset transport-domain data during ingestion development:

```bash
npm run ingestion:reset-dev --workspace @cityline/backend
```

## Testing and Checks

Run all tests:

```bash
npm run test
```

Run frontend tests only:

```bash
npm run test --workspace @cityline/frontend
```

Run backend tests only:

```bash
npm run test --workspace @cityline/backend
```

Run type checks:

```bash
npm run type-check
```

Run lint:

```bash
npm run lint
```

## Next Steps

- expand collected manifests for more lines and providers in Sao Francisco do Sul
- replace placeholder stop coordinates with reviewed geographic data
- normalize and import full direction paths and stop time predictions
- connect the frontend more directly to the normalized transport catalog
- improve ingestion validation, conflict handling, and developer tooling
- prepare the project for broader city coverage after the first dataset is stable

## Environment

Typical local values:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=file:./dev.db
JWT_SECRET=cityline-dev-secret-change-me
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Portfolio Notes

This project is being shaped as a portfolio piece with both product and data-engineering concerns:
- clear domain modeling for mobility data
- pragmatic repository/service split on the backend
- direction-aware scheduling and mapping
- authenticated geolocation features with graceful fallback
- an ingestion pipeline that turns collected transport manifests into canonical importable datasets
