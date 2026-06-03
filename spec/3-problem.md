# Problem 3 — Database & stats

## Requirement
- Create a simple backend server.
- Store results in any SQL database, modelled relationally and structured to expand for
  future use cases.
- Display simple stats back to the user: wins and losses for each player.

## Deep dive

### The pivotal decision: who is a "player"?
"Wins and losses for each player" only means something if players have identity across games.
- **Named players** — capture two names before a game; store games against player references;
  aggregate stats by player. This is what makes the feature real and gives the relational model
  something to relate. Costs a small name-input step in the UI.
- **Symbol-only** — treat "X" and "O" as the players. Trivial, but X/O aren't persistent
  identities, so the stats say little.

This choice ripples back into the game UI (it needs somewhere to enter names), so decide it first.

### Backend stack
- **Express + better-sqlite3** — tiny, synchronous, no DB server to run, file-backed,
  relational. The cleanest fit for "simple".
- Alternatives: Express + async `sqlite3` (more ceremony); Fastify or bare `http` (more
  boilerplate); Postgres (needs a running server — against "simple"); Prisma/Knex (nice
  schema/migrations but a heavier dependency — against brevity).

### Schema (relational, expandable)
Problem 3 *explicitly* asks for an expandable relational structure, so a normalised schema is
the right call here (this is not a CLAUDE.md "don't abstract" violation — expandability is the
stated requirement). A clean baseline:

```
players(id PK, name UNIQUE, created_at)
games(id PK, board_size, is_draw, winner_player_id FK→players NULL, created_at)
game_players(game_id FK→games, player_id FK→players, symbol)   -- composite PK (game_id, symbol)
```

- The `game_players` join models "which players were in a game, as which symbol" and extends to
  >2 players or rematches without reshaping the tables.
- Simpler alternative: bake `player_x_id` / `player_o_id` columns onto `games` (less normalised,
  fewer joins, harder to expand).
- A `moves(game_id, player_id, position, move_number)` table is a natural future extension
  (replays); design so it can be added, but it's optional now.

### Stats semantics
Winner → a win for that player and a loss for the opponent. Draws counted separately (neither a
win nor a loss). Display per player: wins, losses, and likely draws / games played.

### API
Keep it to two endpoints:
- `POST /api/games` — `{ players: [{ name, symbol }], boardSize, winnerName | null, isDraw }`.
  Upserts players, inserts the game and its `game_players` rows.
- `GET /api/stats` — per-player aggregates `[{ name, wins, losses, draws, played }]`.

### Client integration — the legitimate `useEffect`
Persistence and fetching are exactly the genuine side effects CLAUDE.md endorses:
- **Persist on game over:** a `useEffect` keyed on the terminal state, guarded to POST exactly
  once per game (reset the guard on new game). The idiomatic "react to a state transition with a
  side effect" pattern — a clean positive example of the skill being assessed. (Alt: POST inside
  the move handler that ends the game — no effect, but mixes a side effect into a state update.)
- **Load stats:** `useEffect` on mount, re-fetched after a result is recorded.

### Stats UI
Show stats in an inline panel/component, not a route (no router unless a screen needs one).

### Dev wiring
Run the server on its own port (e.g. 4000). Use the webpack devServer `proxy` to forward
`/api` → `:4000` so the client uses relative URLs with no CORS and no hardcoded host. Document
running both, or add a single `concurrently` script.

## Decisions (locked)
1. **Player identity** — ✅ **Named players.** Two names entered at game setup; games
   reference players; stats aggregate per name across games.
2. **Backend stack** — ✅ **Express + Prisma + SQLite** (`file:./dev.db`), server in
   **TypeScript**. Strong normalisation and explicit relational modelling via the Prisma schema.
3. **Schema** — ✅ **Normalised `Player` / `Game` / `GamePlayer`** join. (`moves` table added in
   Problem 4 — see `spec/4-ongoing-games.md`.)
4. **Persistence trigger** — ✅ **`useEffect` on game-over**, guarded to POST once per game
   (reset on new game).
5. **Stats UI** — ✅ **Inline panel** showing **Wins / Losses / Draws / Played** per player
   (no router).
6. **Dev wiring** — ✅ **webpack `/api` proxy → :4000** (default; relative URLs, no CORS).

### Implementation decisions
- **Name entry** — ✅ **Setup gate.** A setup view (two names + size + k) with **Start**, disabled
  until names are non-empty and distinct; the board follows, with **New game** (rematch) and
  **Change setup**. This relocates the size/k sliders into setup (see spec/2).
- **Backend tests** — ✅ **Pure unit tests** (`computeStats`, `parseGameBody`) + e2e verification
  (run it, curl, browser). No supertest/integration DB.
- **Name autocomplete** (Problem 4) — ✅ Setup name inputs use a native `<datalist>` of existing
  player names, sourced from the `stats` already fetched on mount (players only exist via recorded
  games, so `stats` lists them all — no new endpoint). Free-typing still allows new names.

### Prisma + SQLite implications
- Models: `Player(id, name unique, createdAt)`; `Game(id, boardSize, winLength, isDraw,
  winnerId FK→Player?, createdAt)`; `GamePlayer(gameId FK, playerId FK, symbol)` keyed on
  `(gameId, symbol)`. `boardSize` and `winLength` (k) are stored per game for future use.
- Normalisation: per-player W/L/D is **derived** from `Game.winnerId` + `Game.isDraw`, never
  duplicated onto `GamePlayer`.
- SQLite caveat: Prisma has no native enums on SQLite, so `symbol` is a validated `String`
  ('X' | 'O') enforced in app code.
- Setup: `prisma migrate dev` creates the DB; `prisma generate` builds the typed client.
- `POST /api/games` body: `{ players: [{ name, symbol }], boardSize, winLength, winnerName |
  null, isDraw }`. `GET /api/stats` → `[{ name, wins, losses, draws, played }]`.
