# Purrmanent Backend

## Overview

The Purrmanent backend is a NestJS 11 application with TypeORM, PostgreSQL + pgvector, and better-auth for authentication. It provides a REST API for the frontend, an AI coach powered by LLM (via Bynara router), and a RAG knowledge base using local embeddings.

## Architecture

```
src/
  modules/              # Feature modules
    auth/               # Authentication (better-auth, guards)
    cats/               # Cat CRUD, photo management
    checklist/          # Daily/phase boards, kanban, cron jobs
    coach/              # AI coach (LLM streaming, tools, actions)
    crisis/             # Crisis protocols, AI fallback
    dashboard/          # Dashboard aggregation
    gamification/       # Points, badges, streak tracking
    health/             # Health records, reminders
    notification/       # Push notifications (web-push)
    onboarding/         # Questionnaire, plan generation
  common/               # Shared services
    llm/                # LLM service (OpenAI-compatible)
    embeddings/         # Local embeddings (all-MiniLM-L6-v2)
    corpus/             # RAG corpus file loader
    plan/               # 3-3-3 rule plan generation
    events/             # Event emitter for decoupled modules
    filters/            # Global exception filter
  database/             # DataSource, migrations, corpus repository
  entities/             # TypeORM entities
  config/               # Environment validation (Zod)
  migrations/           # TypeORM migrations
  scripts/              # Seed + corpus ingestion
data/
  corpus/               # RAG knowledge chunks (*.md)
  crisis-protocols/     # Crisis protocol slides (*.md)
```

**Module pattern:** Each module has `*.controller.ts`, `*.service.ts`, `*.schema.ts` (Zod DTOs).

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) (package manager)
- PostgreSQL 16 with [pgvector](https://github.com/pgvector/pgvector) extension

## Setup

```bash
cd src/backend

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Fill in your env vars (see table below)

# Run database migrations
pnpm migration:run

# Seed demo data (optional)
pnpm seed

# Ingest RAG corpus
pnpm ingest:corpus

# Start dev server
pnpm start:dev
```

The API runs at http://localhost:3001. Swagger docs at http://localhost:3001/docs (dev only).

## Environment Variables

Create `.env` with these variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | **Yes** | — | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | No | `http://localhost:3001` | Backend URL for auth callbacks |
| `FRONTEND_ORIGINS` | No | `http://localhost:3000` | Comma-separated allowed origins |
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |
| `PORT` | No | `3001` | Server port |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth client secret |
| `COOKIE_DOMAIN` | No | — | Cross-subdomain cookie domain |
| `RESEND_API_KEY` | No | — | Email service key |
| `MAIL_FROM` | No | `Purrmanent <onboarding@resend.dev>` | Sender address |
| `LLM_API_KEY` | No | — | API key for LLM provider |
| `LLM_BASE_URL` | No | `https://router.bynara.id/v1` | LLM API base URL |
| `LLM_MODEL` | No | `mimo-v2.5-hermes` | Standard model |
| `LLM_MODEL_PRO` | No | `mimo-v2.5-pro-hermes` | Pro model (crisis fallback) |
| `VAPID_PUBLIC_KEY` | No | — | Web push public key |
| `VAPID_PRIVATE_KEY` | No | — | Web push private key |
| `VAPID_SUBJECT` | No | `mailto:team@purrmanent.app` | Push notification subject |
| `APP_TIMEZONE` | No | `Asia/Jakarta` | Default timezone for crons |

Only `DATABASE_URL` is strictly required to boot. Other keys are optional — features fail at call-time, not at boot.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm start:dev` | Start dev server with watch |
| `pnpm build` | Production build |
| `pnpm start:prod` | Start production server |
| `pnpm test` | Run unit tests (Jest) |
| `pnpm test:e2e` | Run e2e tests |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Run Prettier |
| `pnpm migration:run` | Run pending migrations |
| `pnpm migration:revert` | Revert last migration |
| `pnpm migration:generate src/migrations/<Name>` | Generate migration from entity diff |
| `pnpm seed` | Seed demo data |
| `pnpm ingest:corpus` | Build RAG corpus from markdown files |

## Database

- **ORM:** TypeORM with `synchronize: false` (migrations only)
- **Extensions:** pgvector for vector similarity search
- **Migrations:** Located in `src/migrations/`, run with `pnpm migration:run`
- **Entities:** Located in `src/entities/`, aggregated in `index.ts`

### Generating Migrations

```bash
# After changing entities
pnpm migration:generate src/migrations/YourMigrationName
pnpm migration:run
```

## RAG Knowledge Base

The AI coach uses a Retrieval-Augmented Generation (RAG) system backed by pgvector.

**How it works:**
1. Knowledge chunks are markdown files in `data/corpus/` with YAML frontmatter
2. `pnpm ingest:corpus` reads all chunks, embeds them locally (all-MiniLM-L6-v2, 384 dimensions), and stores vectors in `ai_coach_corpus`
3. At query time, the coach embeds the user's question and finds the nearest chunks via cosine similarity
4. Retrieved chunks are injected into the LLM prompt as context

**Adding knowledge:** Drop a new `.md` file in `data/corpus/` with frontmatter (`source`, `topic`) and re-run `pnpm ingest:corpus`.

**Crisis protocols:** Located in `data/crisis-protocols/`, also embedded into the corpus.

## API Reference

Swagger/OpenAPI docs are available at `/docs` in development mode. Disabled in production.

## Testing

- **Unit tests:** Jest (`pnpm test`), colocated as `*.spec.ts`
- **E2E tests:** Jest + supertest (`pnpm test:e2e`)
- Tests are colocated next to the source file

## Important Notes

- Package manager is **pnpm** — never use npm
- Never enable `synchronize` — use migrations only
- pgvector queries use raw SQL in `CorpusRepository` (TypeORM has no native vector type)
- The coach chat uses POST-SSE streaming (not EventSource)
- External-service keys are optional — features degrade gracefully when missing
