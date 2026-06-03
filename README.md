# Tic-Tac-Grow

A configurable **k-in-a-row** tic-tac-toe. Pick a board size (3–15) and how many marks in a
row win, play two named players head-to-head, and track a persisted win/loss/draw
leaderboard. Games left mid-play survive a refresh and can be resumed.

> The original assessment brief (Problems 1–3) is kept verbatim at the end of this file.
> Problem 4 — resumable games on a canonical move-log model — was added on top.

## Getting started

Prerequisite: **Node** (18+). From the repo root:

```bash
npm run setup   # install client + server deps and create the SQLite DB (prisma migrate)
npm run dev     # API on :4000 and client on :3001 (proxied), together
npm test        # client and server test suites
```

Then open http://localhost:3001. Working in one package? `npm --prefix server run dev`,
`npm --prefix client start`, or from `client/`: `npm run lint` / `npm run knip` / `npm run build`.

## User guide — how to play

1. **Set up the match.** Enter two distinct names — the inputs autocomplete from players
   you've used before. **Start** stays disabled until both names are present and different.
2. **Choose the board.** Two sliders: **board size** (3–15) and **win length** k — how many
   in a row wins (3 up to the board size). Shrinking the board below k drags k down with it.
3. **Play.** Players alternate X then O. The banner shows whose turn it is, the winning line
   is highlighted, and the board locks the instant someone wins or it's a draw.
4. **Again?** **New game** replays the same match-up; **Change setup** returns to setup.
5. **Resume.** A game you leave mid-play is saved locally. After a refresh, setup lists
   unfinished games — **Resume** restores the exact board and turn, **Discard** drops it.
6. **Leaderboard.** Finished games sync to the server; the table shows wins / losses /
   draws / played per player.

## Developer guide

### Layout
- **[`client/`](client)** — React 18 + TypeScript, TailwindCSS, webpack dev server (:3001,
  proxies `/api` → :4000).
- **[`server/`](server)** — Express + Prisma + SQLite (:4000).

### The canonical model: the move log
A game is fully described by its **ordered move positions**. Everything else *derives*:
- **board** — replay the moves (move `i` → `X` if `i` is even, else `O`);
- **whose turn** — `moves.length` parity;
- **winner / draw** — `winner(board, size, k)`.

So one shape — `{ players, boardSize, winLength, moves }` — is used identically in React
state, in `localStorage`, and in the `POST /api/games` body. That is *why* the local copy
and the database never drift: they store the same thing.

### Data model (normalised, built to expand)
`Player` · `Game` · `GamePlayer` · `Move` — see [`schema.prisma`](server/prisma/schema.prisma).
Win/loss/draw are derived from `Game.winnerId` + `isDraw`, never duplicated onto rows. Symbol
is a validated `'X' | 'O'` string because SQLite has no Prisma enums.

### The server is the source of truth
`POST /api/games` does not trust the client's claimed result. It replays the submitted move
log through [`deriveResult`](server/src/game.ts) and rejects (`400`) a result that doesn't
match the log, or a log that isn't a finished game — so the leaderboard can't be poisoned by
a win that never happened.

### Key files
| Area | File | Role |
|---|---|---|
| Game logic | [`client/src/game.ts`](client/src/game.ts) | pure `winner` (k-in-a-row), `isDraw`, `emptyBoard` |
| App state | [`main.tsx`](client/src/main.tsx) | owns state + effects; chooses the screen |
| Screens | [`Setup.tsx`](client/src/Setup.tsx) · [`Play.tsx`](client/src/Play.tsx) · [`Leaderboard.tsx`](client/src/Leaderboard.tsx) | presentational |
| Board | [`Board.tsx`](client/src/Board.tsx) · [`Cell.tsx`](client/src/Cell.tsx) | grid + memoised cell |
| Persistence | [`storage.ts`](client/src/storage.ts) · [`api.ts`](client/src/api.ts) | localStorage + fetch |
| Server | [`game.ts`](server/src/game.ts) · [`validate.ts`](server/src/validate.ts) · [`app.ts`](server/src/app.ts) · [`stats.ts`](server/src/stats.ts) | verify · validate · routes · tally |

## What's been taken into consideration

The project follows [`CLAUDE.md`](CLAUDE.md): brevity and clarity, the simplest solution that
solves the problem, no abstraction for hypothetical futures, and pure game logic kept out of
the components.

### React — chosen for performance *and* readability
- **Single source of truth.** State is just `board` / `player` / `moves`. Winner, draw and
  current player are **derived during render** — never mirrored into state, never computed in
  an effect.
- **`useEffect` only for genuine side effects** — saving to localStorage, POSTing on finish,
  fetching stats, loading the resume list. Each is annotated, and the stats fetch uses a
  cleanup flag for last-write-wins so a slow request can't clobber fresher data.
- **Memoisation only where scale earns it.** `React.memo(Cell)` plus a dependency-free
  `useCallback` handler mean a move on a 15×15 (225-cell) board re-renders only the changed
  cell, not the whole grid. There is deliberately **no `useMemo`** on the win scan — it is
  sub-millisecond at 225 cells, so adding one would be cargo-cult.

### Performance
- Win detection is `O(size² · k)` with bounds-checked runs, so a line never wraps a row edge.
- A flat 1-D board makes win-line generation pure index math that scales to large boards.
- Per-cell render isolation keeps interaction snappy at the maximum size.

### Readability
- `Main` is split into `Setup` and `Play` so each screen tells its own story; shared Tailwind
  tokens live in [`ui.ts`](client/src/ui.ts).
- A small `TONES` lookup replaces a nested status-colour ternary.

## Review & hardening

A devil's-advocate pass over the four problems produced these changes, each its own commit:

| Fix | What it addressed |
|---|---|
| Track the `moves` migration | committed code referenced a `Move` table whose migration was untracked — a clean checkout would 500 on the first save |
| Derive & verify server-side | the server now replays the move log to confirm the result instead of trusting the client; drops a redundant winner lookup |
| Server unit tests | `winnerSymbol` / `deriveResult` — closes the move-parity gap that had zero coverage |
| Trim redundant scan | removed a per-click `winner()` recompute already covered by the board's `disabled` state |
| Split `Main` | the 230-line component became `Setup` / `Play` / `Leaderboard` |
| Reconcile the spec | spec/4's testing section now matches what actually exists |

Two findings were **reversed on closer inspection** rather than "fixed":
- `statsVersion` looked like ceremony, but its effect cleanup gives last-write-wins fetch
  cancellation — kept.
- The `Move` table is write-only today but defensible under the brief's "expand for future
  use cases" — kept, and *made to earn its place* by the verification step above.

Coverage: **24 server + 41 client tests pass**; lint, knip and build are clean.

---

*Below is the original assessment brief, kept verbatim. The authoritative setup and run
commands are under [Getting started](#getting-started) above — the brief's Quickstart predates
the server.*

# Tic-Tac-Toe
The below problems are to allow us a glimpse into your problem solving ability, style and current skill set. Vibe coding is allowed but we are looking for good taste, brevity and clarity in your code. 

## Problems
### Problem 1
We have started a basic game of Tic-Tac-Toe as outlined [here](https://en.wikipedia.org/wiki/Tic-tac-toe) but we don't have anyone good enough to code to finish it! 
- Please implement a complete basic game of Tic-Tac-Toe
- Please use React and TypeScript throughout, if you know TailwindCSS please expand on what is already provided, otherwise it is fine to use raw styling 
- Both players will play out of the same application, it is sufficient to just switch the current player each time a move is played
- Once a game is completed, I should be able to start another game 

### Problem 2
We are bored with the basic game now, can you make it so the board can be scaled to any size? 
- Add some kind of input which allows me to change the board size
- The board size should be a number between 3 and 15 

### Problem 3
We want to store game results in a database.
- Create a simple backend server
- Use any SQL database to store the results, please structure it in a relational manner and in a way for it to be expanded for future use cases 
- Display simple stats back to the user including number of win and losses for each player

## Quickstart
- Make sure you have **node** installed
- `cd client`
- `npm i`
- `npm start`

## Submission
Once you are done please submit the public repo to your recruiter or invite nick@spruce.eco to your private repo and let your recruiter know. 
