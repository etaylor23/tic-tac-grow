# CLAUDE.md

## Stack
- React 18 + TypeScript.
- TailwindCSS for styling.
- Webpack dev server (port 3001).
- Jest with ts-jest, node environment.

## Principles
- Optimise for brevity and clarity.
- Prefer the simplest solution that solves the problem.
- Do not abstract for hypothetical future needs.
- Match the existing code style exactly.

## Development flow (per problem)
1. Spec — capture the problem and decisions in `spec/N-problem.md`.
2. Unit tests — write failing tests for the pure logic (`game.ts`) first.
3. Component tests — write failing React component/interaction tests next.
4. Implementation — write the minimum code to make the tests pass.
5. Lint & prune — run `npm run lint` and `npm run knip`; fix lint errors and remove dead
   code/exports/deps (see `spec/tooling.md`).
6. Reconcile — keep spec, tests, and implementation in lock step; update the spec if reality diverges.

## Style
- Formatting is Prettier-enforced (`prettier.config.js`): semicolons, double quotes,
  trailing commas (all), 2-space indent, 80-col width, always-parenthesised arrow params.
- Function components, named exports, arrow functions.
- Style with Tailwind; avoid raw CSS unless Tailwind cannot express it.
- Add `key` props to every mapped list.
- Handle `undefined` cells explicitly (`strictNullChecks` is on).

## React
- Use `useEffect` only for genuine external side effects (network, persistence).
- Never compute or store winner, draw state, or current player in `useEffect`; derive them during render.
- Use `useMemo` / `useCallback` only for measurable cost or required referential stability.
- Keep game logic in pure functions, separate from components.

## Features
- Two players alternate turns within one app.
- Detect wins and draws.
- Allow starting a new game once one ends.
- Make board size configurable via an input, constrained to 3–15 inclusive.
- Persist game results to a relational SQL database, structured for future expansion.
- Display win and loss counts per player.

## Don't
- Don't add state libraries (Redux / Zustand / MobX), UI kits, or form libraries.
- Don't add a router unless a screen requires one.
- Don't add tooling or config beyond what a feature requires.

## Testing
- Unit-test pure game logic in the node environment.
- Test React components/interactions with `@testing-library/react` under jsdom (opt in per file
  with `/** @jest-environment jsdom */`).

## Commands
From the repo root:
- `npm run setup` — install client + server and create the SQLite DB.
- `npm run dev` — run the API (:4000) and client (:3001) together (`concurrently`).
- `npm test` — run both test suites.

From `client/`:
- `npm start` — dev server at http://localhost:3001 (proxies `/api` → :4000).
- `npm test` / `npm run lint` / `npm run knip` / `npm run build`.

From `server/`:
- `npm run dev` — API server on :4000 (`tsx watch`).
- `npm run prisma:migrate` — apply migrations / create `dev.db`.
- `npm test` — Prisma-free unit tests (`computeStats`, request validation).

## Layout
- `client/` — React app.
- `server/` — separate Express + Prisma + SQLite backend; strongly normalised schema. Symbol
  stored as a validated string ('X' | 'O') — Prisma has no enums on SQLite.
- Persistence: in-progress games live in `localStorage` (`client/src/storage.ts`); finished games
  sync to the DB. Both share one model — `Player` / `Game` / `GamePlayer` / `Move` — where the move
  log is the ordered cell positions (board/turn/winner all derive from it).
