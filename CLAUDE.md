# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Lotus Ops v2 — a single-admin operations app for AaraSaan Consulting (clients, projects, contracts, time tracking, invoicing). Next.js 16 + React 19 on Vercel, Supabase Auth, Postgres via Drizzle.

## Commands

```bash
npm run dev          # next dev (Turbopack — webpack is gone in Next 16)
npm run build        # next build
npm run start        # next start
npm run lint         # eslint (uses flat config in eslint.config.mjs)

npm run db:generate  # drizzle-kit generate (after editing src/db/schema.ts)
npm run db:migrate   # apply pending migrations from ./drizzle
npm run db:studio    # open Drizzle Studio
```

There is no test runner configured. Node is pinned to `20.x` in `engines` (Vercel uses AL2023 functions); do not bump without checking deploy compatibility.

## Next.js 16

This project runs Next.js 16, which has breaking changes from training-data-era Next.js. Before writing routing, server-action, caching, or middleware code, read the relevant doc in `node_modules/next/dist/docs/` and heed deprecation notices. Specific divergences already in this repo:

- **`proxy.ts` instead of middleware.ts internals** — auth session refresh lives in `src/lib/supabase/proxy.ts` and is invoked from `src/middleware.ts`. The Supabase SSR cookie pattern here is the current correct one for Next 16; copy it rather than regenerating from memory.
- **Async dynamic APIs** — `cookies()`, route `params`, etc. are `Promise`s. See `src/lib/supabase/server.ts` (`await cookies()`) and PDF route handlers (`{ params }: { params: Promise<{ id: string }> }`).
- **Turbopack is the default**; there is no webpack config. `next.config.ts` uses `turbopack: {}`.
- **No `unstable_*` cache helpers from older docs** — use the documented Next 16 caching primitives.

## Architecture

### Routing & auth boundary

- `src/app/(admin)/` — authenticated app shell. The route group's `layout.tsx` calls `supabase.auth.getUser()` and redirects to `/login` if absent, then renders `Sidebar` (desktop) + `BottomTabBar` (mobile). All admin pages (`dashboard`, `clients`, `projects`, `contracts`, `invoices`, `time-tracking`, `settings`) live here.
- `src/app/login/`, `src/app/auth/{callback,signout}/` — public auth flow.
- `src/middleware.ts` → `updateSession()` in `src/lib/supabase/proxy.ts` refreshes the Supabase session cookie on every page request. **`/api/*` is intentionally skipped** in the middleware matcher AND inside `updateSession` — API routes are public and authenticated by UUID knowledge (sharing an invoice/contract link). Skipping `/api/` also avoids hitting Vercel's 8KB response-header limit when session cookies are large.
- `src/app/api/` — public route handlers for PDF generation (`pdf/invoice/[id]`, `pdf/contract/[id]`), email send (`email/invoice`, `email/time-summary`), and CSV export (`time-tracking/export-csv`).

### Data layer

- **Drizzle + postgres-js** against Supabase Postgres. `src/db/index.ts` uses `postgres(url, { prepare: false })` — required for the Supabase pooler. `DATABASE_URL` MUST be the **session-mode pooler URL** (port 5432), not direct connect; `.env.example` shows the format.
- Schema lives in `src/db/schema.ts` (single file, ~150 lines). Tables: `app_settings` (singleton row, id=1), `clients`, `contacts`, `projects`, `contract_templates`, `contracts`, `time_entries`, `invoices`, `invoice_line_items`. Migrations are in `./drizzle/` and `drizzle.config.ts` filters to exactly these tables (don't add tables without updating `tablesFilter`).
- `app_settings` is a singleton (`id=1`) — code upserts it via `insert().values({id:1}).onConflictDoNothing()` before reading. Invoice/contract numbering uses prefix + start-number from this row plus `count(*)` of the table; see `src/lib/invoice-number.ts` and `src/lib/contract-number.ts`.

### Server actions

All mutations go through `src/app/actions/*.ts` (`'use server'`). Each file exports an `ActionResult<T>` discriminated union:

```ts
type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }
```

Actions call `revalidatePath()` after mutations. New mutations should follow this pattern (don't throw — return the union).

### Supabase clients (three flavors — pick the right one)

- `src/lib/supabase/client.ts` — browser/client components.
- `src/lib/supabase/server.ts` — `createClient()` for server components / route handlers; reads cookies via `next/headers`.
- `src/lib/supabase/proxy.ts` — `updateSession()` for middleware only.
- `src/lib/supabase/admin.ts` — `createAdminClient()` uses `SUPABASE_SERVICE_ROLE_KEY`. Server-only, used for storage operations against private buckets (e.g. uploading contract PDFs in `actions/contracts.ts`). Never import from a client component.

### PDF generation

PDFs are rendered server-side with `@react-pdf/renderer` (see `src/app/api/pdf/invoice/[id]/route.ts` and `src/components/invoices/InvoicePDF.tsx`). The route returns `Content-Disposition: inline` for in-browser viewing; client code that wants a forced download fetches the same URL and re-serves it with `attachment` — keep that split intact.

`next.config.ts` has `serverExternalPackages` for `puppeteer-core`, `@sparticuz/chromium`, `@react-pdf/renderer`, plus `outputFileTracingIncludes` to bundle the chromium binary for the PDF routes. `src/lib/browser.ts` (puppeteer launcher) is a legacy helper from before the @react-pdf migration; current PDF routes do not use it.

### Design system

Earth-tone tokens defined in `src/app/globals.css` (`:root` CSS variables → `@theme inline` for Tailwind v4). Use `var(--accent)`, `var(--text)`, `var(--surface)`, etc. or the matching Tailwind classes (`bg-bg`, `text-text-muted`, `border-border-dark`). Fonts: `--font-cormorant` (display), `--font-syne` (small caps labels), `--font-jost` (body). The palette is shared across `lotus-list` / `lotus-ledger` / `lotus-ops` — keep tokens in sync if changing.

### Path alias

`@/*` → `./src/*` (see `tsconfig.json`).
