<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Purrmanent Frontend

Guidance for AI agents working in `frontend/purrmanent`. Read this before changing code.

## Golden rule: package manager

**Use `bun` (and `bunx` instead of `npx`). NEVER use `npm`/`npx`/`pnpm`.** The repo is
locked with `bun.lock`.

```bash
bun install
bun run dev          # dev server (Turbopack)
bun run build        # production build (also runs tsc)
bun run typecheck    # tsc --noEmit
bun run lint         # eslint (flat config, type-aware)
bun run test:run     # vitest (unit/component)
bun run test:e2e     # playwright (needs dev server + backend running)
bunx <tool>          # not npx
```

**Always verify a change with `bun run typecheck && bun run lint && bun run build`** (and
`bun run test:run` when touching logic) before considering it done.

## Stack

- **Next.js 16** App Router (Turbopack), **React 19**, **TypeScript 5**
- **Tailwind CSS v4** (CSS-config via `@theme` in `app/globals.css`; no `tailwind.config.js`)
- **TanStack Query** (server state), **better-auth** (auth client), **react-hook-form + zod** (forms)
- **Radix UI** primitives, **@dnd-kit** (kanban), **embla-carousel** (crisis), **Recharts** (charts),
  **motion** (Framer Motion), **driver.js** (site tour), **@supabase/supabase-js** (direct image upload),
  **next-intl** (i18n, EN), **react-markdown + remark-gfm** (chat markdown), **lucide-react** (icons)
- Path alias **`@/*` → repo root** (`@/features/...`, `@/lib/...`, `@/components/...`)

## Architecture (feature-sliced, one-way deps)

`app/` (routing only) → `features/` (domain) → `components/ui` + `lib/`.

```
app/
  (marketing) landing: app/page.tsx, app/about/page.tsx   # public, dark canvas
  (auth)/      login, register, verify-email              # public, dark canvas
  (app)/       authenticated shell (layout.tsx = AuthGuard > ActiveCatProvider > CopilotProvider > AppShell)
    dashboard, cats, cats/[catId] (+ /health, /settings), coach, crisis, progress, onboarding
  layout.tsx (fonts + Providers), globals.css (@theme tokens), styleguide/ (dev)
features/<domain>/   api.ts (apiFetch fns) · hooks.ts (TanStack Query) · *.tsx (components)
  auth, cats, checklist, coach, crisis, dashboard, gamification, health, notifications, onboarding
components/ui/       design-system primitives (Button, Card, Field, SelectField, Dialog, Tabs,
                     Checkbox, Toast, Pill/Chip, Markdown, TypingDots, motion, Spinner) + index.ts barrel
components/layout/   AppShell, Nav, BottomNav, Footer, PublicHeader, BackButton
lib/                 api/ (client+config), auth/ (better-auth), query/ (client+keys),
                     supabase/ (browser storage client), types/api.ts, validation/schemas.ts, utils/cn.ts
providers/           QueryProvider, IntlProvider, ToastProvider (composed in index.tsx)
messages/en.json     i18n strings
```

Import primitives from `@/components/ui`. A feature usually has `api.ts` + `hooks.ts` + components.

## API integration (`lib/api`)

- `apiFetch<T>(path, { method, body, query, headers })` — the single backend boundary.
  Always `credentials: "include"` (cookie session), JSON-encoded, and parses the backend
  error envelope `{ error: { code, message, details } }` into a typed `ApiError`.
- **Quirk:** list/query params are **snake_case** (`cat_id`, `code`) passed via `query`;
  request bodies are **camelCase** DTOs. Don't hand-build URLs.
- Auth: `lib/auth/client.ts` (`authClient` from `better-auth/react`) → `signIn.email`,
  `signUp.email`, `signIn.social({provider:'google'})`, `signOut`, `useSession`.
- **Coach chat is POST-SSE** (not JSON, not EventSource): `features/coach/stream.ts` reads
  the body stream and dispatches `sources` / `delta` / `confirm` / `[DONE]` events.

## Design system (`DESIGN.md` tokens)

Sentry-inspired, two-polarity (deep-violet dark canvas vs white light canvas). Tokens live in
`app/globals.css` `@theme` → Tailwind utilities (`bg-surface-canvas-dark`, `text-accent-lime`, `font-display`).

- **CRITICAL color gotcha:** use **`text-muted`** for secondary text on LIGHT surfaces and
  **`text-on-dark-muted`** (white) ONLY on dark surfaces. Mixing them up renders invisible text.
- `--color-danger` (red) is for Crisis/destructive actions.

## Conventions & React 19 gotchas (these have bitten us)

1. **No `z.coerce` / `z.default` in zod schemas used by `zodResolver`** — it makes the RHF
   input type `unknown` and breaks the build. Use plain types + RHF `setValueAs` (numbers) or a
   controlled component.
2. **`react-hooks/set-state-in-effect` is an ERROR** — never call `setState` in `useEffect`.
   Derive state with `useMemo` (see `ActiveCatProvider`).
3. **`react-hooks/immutability` is an ERROR** — no mutating render-scoped variables during
   render (precompute with `useMemo`).
4. **Never call hooks conditionally.** For the daily/phase board, separate `DailySection` /
   `PhaseSection` components each call their own hook (Radix Tabs unmounts inactive content).
5. Custom selects use **`SelectField`** (Radix) wired via RHF **`Controller`** — not native `<select>`.
6. Render assistant/LLM/markdown via the **`Markdown`** component (GFM + prose), never raw HTML.

## Environment

`.env.local` (gitignored; template in `.env.example`):
`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(publishable key — never the service role), `NEXT_PUBLIC_SUPABASE_BUCKET`. Next reads it at
startup — restart the dev server after editing.

## Testing

Vitest + RTL (`*.test.ts(x)`, jsdom). Playwright e2e under `tests/e2e/`. Keep non-trivial pure
logic covered (`lib/api/client.test.ts`, `features/coach/api.test.ts`, `components/ui/button.test.tsx`).
