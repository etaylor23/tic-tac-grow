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

## Style
- No semicolons, single quotes, 2-space indentation.
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
- Unit-test pure game logic (node environment).
- DOM/component tests require adding jsdom + `@testing-library/react`.

## Commands (run from `client/`)
- `npm i` — install dependencies.
- `npm start` — dev server at http://localhost:3001.
- `npm test` — run Jest.
- `npm run build` — production build.

## Layout
- `client/` — React app.
- `server/` — separate Express + Prisma + SQLite backend; strongly normalised schema. Symbol
  stored as a validated string ('X' | 'O') — Prisma has no enums on SQLite.
