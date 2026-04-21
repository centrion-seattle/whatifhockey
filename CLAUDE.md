# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — local dev server (next dev)
- `npm run build` — static export to `out/` (Next 15 with `output: 'export'`)
- `npm run lint` — next lint (eslint-config-next / core-web-vitals)
- `npm run start` — serve the production build
- `node scripts/snapshot-schedule.cjs` — regenerate `src/lib/nhl/fallback-schedule.json` from the live NHL API. Run manually when the committed snapshot feels stale. Not part of `npm run build`.

Every script is prefixed with `scripts/check-node.cjs`, which hard-fails if Node < 18.18. Local Node pin is in `.nvmrc` (20); CI uses Node 24.

There is no test framework wired up — do not invent a `npm test` command. Lint is the only automated check.

## Deployment

- `.github/workflows/nextjs.yml` builds on push to `main` and deploys `./out` to GitHub Pages.
- `next.config.ts` sets `basePath: '/whatifhockey'` and `assetPrefix: '/whatifhockey/'` — the site is served at `…/whatifhockey/`. Any new asset paths or links must respect this prefix (use `next/link`, `next/image`, or `basePath`-aware helpers rather than hardcoding `/`).
- `assets.nhle.com/logos/**` is the only remote image host allowlisted for `next/image`.

## Architecture

Next.js App Router site with two top-level sections — `/` (standings with alternative ranking rules) and `/schedule` (season calendar, single-team, head-to-head views). `src/components/site-nav.tsx` is mounted in `src/app/layout.tsx` and drives navigation between them; it uses `usePathname` for active-state styling, so it must remain a client component.

**Data flow (important — static export semantics):** Server components fetch at **build time**, not per request. The `next: { revalidate: 120 }` hints in the fetch modules are effectively no-ops on GitHub Pages; re-deploying is the only way to refresh data. Client components receive everything as props and do all view switching locally with `useMemo`.

- `src/app/page.tsx` → `getStandings()` (one API call).
- `src/app/schedule/page.tsx` → `getStandings()` first (to enumerate the 32 current team abbreviations) → `getSchedule(abbrevs)`, which fans out to `/v1/club-schedule-season/{abbr}/now` in parallel and dedupes games by `id`. Do not hardcode a team list; abbrevs must come from the standings response so rebrands/relocations don't drift.

**Fallback contract:** Each fetch module returns `{ ok, ..., source: 'live' | 'fallback' }`. On failure it imports a committed JSON snapshot and the UI renders a "Sample data" badge. Preserve both behaviors when touching fetch code.
- `src/lib/nhl/fallback.json` — standings fallback, shaped as a raw NHL API response (mapped at runtime).
- `src/lib/nhl/fallback-schedule.json` — schedule fallback, shaped as `{ updatedAt, games: Game[] }` (already in the internal domain shape — not re-mapped at runtime). Regenerate via the snapshot script above; its mapping logic must stay in sync with `src/lib/nhl/map-game.ts`.

**Three-layer separation in `src/lib/`:**
- `lib/nhl/` — NHL API wire format only. `types.ts` + `schedule-api-types.ts` mirror the API; `map.ts` / `map-game.ts` convert raw rows into the internal `TeamStanding` / `Game` shapes. Keep API-specific field names out of the rest of the codebase.
- `lib/standings/` — pure ranking domain (`strategies.ts`, `rank.ts`, `playoffs.ts`). **Adding a ranking method = one entry in `RANKING_STRATEGIES`; the UI selector picks it up automatically.**
- `lib/schedule/` — pure schedule domain (`types.ts`, `helpers.ts` with `groupByDay`, `groupByMonth`, `filterByTeam`, `filterMatchup`, `formatResult`, `getSeasonBounds`, `recordFor`). No React, no presentation strings.
- `lib/format.ts` — shared date / time / result presentation helpers (`formatUtc`, `formatDateShort`, `formatMonthLabel`, `formatTimeShort`, `formatResultLine`). Both views import from here; don't re-add local copies.

**Timezone convention for games.** `Game.gameDateLocal` is the **venue's** calendar day (`YYYY-MM-DD`, verbatim from the API) — canonical "which night did this happen." `Game.startTimeUtc` is the ISO instant, formatted viewer-local via `Intl.DateTimeFormat` for "when does it start for me." Two fields, two questions — don't collapse them.

**Presentation.** Each section has one client component that owns all view-mode state:
- `src/components/standings-view.tsx` — `viewMode` (league / conference / playoffs) + `strategyId`, rendered via `standings-table-parts.tsx` (desktop table + mobile cards).
- `src/components/schedule-view.tsx` — `viewMode` (calendar / team / matchup) + selected team state. Calendar uses a 7-column CSS grid on md+ and a flat day list on mobile. **Adding a schedule view = one entry in `VIEW_OPTIONS` + a branch in the render.**

`src/components/ui/*` are stock shadcn/ui primitives (new-york style, configured in `components.json`) — treat them as generated and prefer composing over editing.

**Path alias:** `@/*` → `src/*` (tsconfig).
