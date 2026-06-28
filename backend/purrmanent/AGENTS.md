# AGENTS.md — Purrmanent Backend

Guidance for AI agents working in `backend/purrmanent`. Read this before making changes.

## Golden rule: package manager

**Use `pnpm` (and `pnpm dlx` instead of `npx`) for everything in this backend. NEVER use `npm` or `npx`.**
The repo is locked with `pnpm-lock.yaml`. `npm install` will desync the lockfile.

```bash
pnpm install            # not: npm install
pnpm dlx web-push generate-vapid-keys   # not: npx web-push ...
```

## What this is

The NestJS backend for Purrmanent — a 90-day cat-parent guide app. Single deployable
Nest application exposing a REST API under the `/api` prefix.

- **Framework:** NestJS 11 (`@nestjs/*`)
- **Language:** TypeScript, `module`/`moduleResolution: nodenext` (ESM-style resolution), target ES2023
- **DB:** PostgreSQL + **pgvector**, via TypeORM (`synchronize: false` — migrations only)
- **Validation:** Zod via `nestjs-zod` (global `ZodValidationPipe`); env validated by Zod at boot
- **Auth:** `better-auth` (email/password + Google OAuth), mounted on raw Express ahead of the body parser
- **AI/RAG:** LLM via Bynara (OpenAI-compatible router); embeddings run **locally** (`@xenova/transformers`, all-MiniLM-L6-v2, 384-dim, no API key)
- **Docs:** Swagger/OpenAPI at `/docs` — **dev only**, disabled when `NODE_ENV=production`

## Commands

```bash
pnpm install              # install deps
pnpm start:dev            # run with watch (default dev loop)
pnpm start:prod           # node dist/main (after pnpm build)
pnpm build                # nest build -> dist/

pnpm test                 # jest unit tests (*.spec.ts under src/)
pnpm test:e2e             # jest e2e (test/)
pnpm test:cov             # coverage

pnpm lint                 # eslint --fix
pnpm format               # prettier --write

# Database (TypeORM CLI via src/database/data-source.ts)
pnpm migration:run        # apply migrations
pnpm migration:revert     # roll back last migration
pnpm migration:generate src/migrations/<Name>   # generate from entity diff

# Data scripts
pnpm seed                 # seed demo users/cats/scenarios/templates
pnpm ingest:corpus        # (re)build the RAG corpus (idempotent: truncates + re-inserts)
```

After any change, run `pnpm build` (or `pnpm test`) before declaring done. Tests use Jest with `rootDir: src`; unit specs are colocated as `*.spec.ts`, e2e lives in `test/`.

## Layout

```
src/
  main.ts                 # bootstrap: prefix, CORS, helmet, better-auth mount, Swagger
  app.module.ts           # root module wiring (ConfigModule, Throttler, all feature modules)
  config/env.ts           # Zod env schema + validateEnv (fail-fast at boot)
  database/               # DataSource, DatabaseModule, CorpusRepository (raw pgvector SQL)
  entities/               # TypeORM entities (index.ts aggregates them)
  migrations/             # TypeORM migrations (the only way schema changes)
  modules/<feature>/      # feature modules: auth, cats, onboarding, checklist,
                          #   gamification, crisis, coach, health, notification, demo
  common/                 # cross-cutting: llm, embeddings, corpus, plan, events,
                          #   filters (AllExceptionsFilter)
  scripts/                # standalone ts-node scripts (seed, ingest-corpus)
data/
  corpus/*.md             # RAG knowledge chunks — one chunk per file (frontmatter + body)
  crisis-protocols/*.md   # crisis protocol slides (## headings + - [ ] todos)
```

A feature module typically contains: `*.module.ts`, `*.controller.ts`, `*.service.ts`,
`*.schema.ts` (Zod DTOs). Match this shape when adding features.

## Conventions

- **Validation:** define request DTOs as Zod schemas in `*.schema.ts` (`nestjs-zod`), not class-validator.
- **Style:** Prettier with `singleQuote: true`, `trailingComma: all`. Run `pnpm format`/`pnpm lint`.
- **Tests:** non-trivial logic gets a colocated `*.spec.ts`. Pure functions are tested without DI/fixtures (see `src/common/corpus/corpus-files.spec.ts`, `src/common/plan/plan.spec.ts`).
- **pgvector:** the `ai_coach_corpus.embedding VECTOR(384)` column is intentionally NOT mapped in TypeORM. All vector writes/searches go through raw parameterized SQL in `CorpusRepository`. Keep it that way.
- **Schema changes:** never enable `synchronize`. Add a migration and run `pnpm migration:run`.
- **Env:** only `DATABASE_URL` is strictly required to boot. External-service keys (LLM, Resend, VAPID, Google, Tavily, Supabase) are optional — the dependent feature fails at call-time with a clear error, not at boot. Add new vars to `config/env.ts` (schema) AND `.env.example`.

## RAG knowledge base

The coach's retrievable corpus lives in the `ai_coach_corpus` table and is built by
`pnpm ingest:corpus` from two sources:

1. `data/corpus/*.md` — one curated chunk per file. Frontmatter (`source`, `topic`,
   optional `sourceUrl`, `language`) + markdown body. **Add knowledge by dropping in a
   new `.md` file**, then re-run the script. Files are validated by Zod at load time
   (`src/common/corpus/corpus-files.ts`).
2. `data/crisis-protocols/*.md` — protocol slides, also embedded into the corpus.

Crisis mode itself uses keyword matching + slides (`src/modules/crisis/`), a separate
path from the coach's vector retrieval — they share source content, not the mechanism.

## Security & secrets

- **Never commit or print secret values.** `.env` is gitignored — keep it that way.
- These files in the parent project dir hold credentials; reference them by name only,
  never echo contents: `.env`, `aikidomcp.txt` (Aikido token), `bynara.txt`.
- New network-exposed routes must go through the existing `AuthGuard`/`RolesGuard` unless
  intentionally public — flag any unauthenticated endpoint you add.
- Global rate limiting is on (`ThrottlerGuard`, 120 req/min per IP); use `@Throttle` to tighten sensitive routes.

## Tooling context (`.kiro/`)

- `.kiro/steering/ponytail.md` — **always-on** steering ("lazy senior dev": reuse before
  writing, smallest correct diff, leave one runnable check for non-trivial logic). Follow it.
- `.kiro/settings/mcp.json` — configures the **Supabase MCP** server (project is hosted on Supabase Postgres in prod).
