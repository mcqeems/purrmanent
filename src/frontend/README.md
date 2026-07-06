# Purrmanent Frontend

## Overview

The Purrmanent frontend is a Next.js 16 application built with React 19, TypeScript 5, and Tailwind CSS v4. It uses a feature-sliced architecture with shadcn/ui components.

## Architecture

```
app/                    # Route pages + layouts (App Router)
  (marketing)/          # Public pages (landing, about)
  (auth)/               # Login, register, verify-email
  (app)/                # Authenticated shell (dashboard, cats, coach, etc.)
features/               # Domain modules
  auth/                 # Login form, register form, auth guard
  cats/                 # Cat management, photo upload
  checklist/            # Kanban board, daily/phase tasks
  coach/                # AI coach chat (SSE streaming)
  crisis/               # Crisis mode with guided protocols
  dashboard/            # Stats, charts, overview
  gamification/         # Points, badges, graduation
  health/               # Health records, reminders
  onboarding/           # Questionnaire, plan generation
components/
  ui/                   # Design system primitives (shadcn)
  layout/               # App shell, nav, footer
lib/
  api/                  # API client (apiFetch)
  auth/                 # better-auth client
  validation/           # Zod schemas
  supabase/             # Image upload client
providers/              # Query, Toast, Intl providers
```

**Data flow:** `app/` (routing) → `features/` (domain) → `components/ui` + `lib/` (shared)

## Prerequisites

- [Bun](https://bun.sh/) (package manager)
- Node.js 22+

## Setup

```bash
cd src/frontend

# Install dependencies
bun install

# Create environment file
cp .env.example .env.local

# Fill in your env vars (see table below)

# Start dev server
bun run dev
```

The app runs at http://localhost:3000.

## Environment Variables

Create `.env.local` with these variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API URL (e.g. `http://localhost:3001`) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Frontend URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL for image uploads |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase publishable key (not service role) |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | No | Storage bucket name (default: `cat-images`) |

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run typecheck` | Run TypeScript checks |
| `bun run lint` | Run ESLint |
| `bun run test:run` | Run unit tests (Vitest) |
| `bun run test:e2e` | Run e2e tests (Playwright) |

## Key Features

**Authentication** — Email/password + Google OAuth via better-auth. Session cookies with CSRF protection.

**Dashboard** — Stats cards (points, streak, cats, completion), pie chart (task breakdown), bar chart (completion by cat), global overview.

**Cats** — Add/edit cats, photo upload to Supabase, personality-based onboarding.

**Checklist** — Kanban board (To-Do / In Progress / Done) for daily and 90-day phase tasks. AI coach can auto-add tasks.

**AI Coach** — Chat with an AI assistant backed by a RAG knowledge base. Supports @mentions, tool calling, and action confirmation.

**Health** — Track vaccinations, weight, vet visits. Automated reminders.

**Crisis Mode** — Step-by-step protocols for common emergencies (not eating, hiding, aggression, etc.).

**Gamification** — Points for completing tasks, badges at milestones, graduation certificate on Day 90.

## Design System

Sentry-inspired two-polarity design (dark violet canvas vs white light canvas). Tokens defined in `app/globals.css` via Tailwind CSS v4 `@theme`.

See [DESIGN.md](DESIGN.md) for the full specification.

## Testing

- **Unit tests:** Vitest + React Testing Library (`bun run test:run`)
- **E2E tests:** Playwright (`bun run test:e2e`)
- Tests are colocated: `*.test.ts(x)` next to the source file

## Important Notes

- Package manager is **Bun** — never use npm/pnpm
- `NEXT_PUBLIC_*` env vars are embedded at build time
- The coach chat uses POST-SSE streaming (not EventSource)
- Auth pages are Server Components for metadata exports; client logic is in separate files
