# Problem 4 — Ongoing games (resume) & autocomplete

## Requirement
- Persist an in-progress game to `localStorage` as it's played.
- On refresh the app lands on the setup page; the user can pick an in-progress game and resume it
  exactly where they left off.
- On finish, the result syncs to the DB as usual.
- Use the same model in localStorage as in Prisma so the two are always in sync.
- (Autocomplete — see [spec/3-problem.md](3-problem.md): setup name inputs suggest existing players.)

## Deep dive

### One canonical model: the move log
A game is fully described by its **ordered move positions**. Everything else derives:
- board — replay the moves (move `i` → `X` if `i` even, else `O`; X starts);
- whose turn — `moves.length` parity;
- winner/draw — `winner(board, size, k)` as before.

So the shared shape is `{ players: [{ name, symbol }], boardSize, winLength, moves: number[] }`,
used identically in the React runtime, in localStorage, and in the `POST /api/games` body. This is
why localStorage and the DB stay in sync — they store the same thing.

### Prisma — build the deferred `Move` table (full parity)
spec/3 deferred a moves table; Problem 4 needs it, so add it now:
```
Move(id PK, gameId FK→Game, playerId FK→Player, position, moveNumber)  @@unique(gameId, moveNumber)
```
`position` = cell index, `moveNumber` = order (0-based). `playerId` is resolved from move parity
(`even → X player`), keeping symbol out of the row (it's derivable) — normalised, and matching the
`moves(game_id, player_id, position, move_number)` shape sketched in spec/3.

`POST /api/games` gains `moves: number[]`. The server validates their shape (ints in `[0, size²)`,
all distinct) and — because the move log is the source of truth — replays them through its own
`deriveResult(moves, size, k)` (a port of the client's `winner`) to confirm the declared
`winnerName`/`isDraw`, rejecting (400) a result that doesn't match the log or a log that isn't a
finished game. `winnerId` comes from the replay, not from the client's claim. It then creates the
`Move` rows inside the existing transaction. `GET /api/stats` is unchanged.

### localStorage — `client/src/storage.ts`
Key `tic-tac-grow:ongoing` holds an array of `OngoingGame`
(`{ id, players, boardSize, winLength, moves, updatedAt }`). Pure wrappers, guarded JSON parse:
`loadOngoing()`, `saveOngoing(game)` (upsert by id), `removeOngoing(id)`.

### Runtime state — add the log
Game state becomes `{ board, player, moves }`: `board`/`player` remain the runtime projection
(Problems 1–2 decisions), and `moves` is the append-only log that drives persistence and replay —
all updated atomically in the click reducer. A `gameId` (`crypto.randomUUID()`) ties the runtime
game to its localStorage entry.

### Effects (all genuine side effects, the only kind CLAUDE.md allows)
- **Save on progress** — while playing, not over, and `moves.length > 0`: `saveOngoing(...)`.
- **Sync + clear on finish** — the existing persist effect now also sends `moves`, then
  `removeOngoing(gameId)` (it's in the DB now) and refreshes stats.
- **Load resume list** — when `phase === 'setup'`, `setOngoing(loadOngoing())`.

### Setup view — resume list
When there are saved games, show a "Resume a game" list above Start; each row:
`X vs O — n×n, k=…, m moves` with **Resume** (replay `moves` to rebuild state, reuse the saved id)
and **Discard** (`removeOngoing`).

## Decisions (locked)
1. **Model** — ✅ One shared `{ players, boardSize, winLength, moves }`; board/turn/winner derived.
2. **DB parity** — ✅ Add the Prisma `Move` table; finished games persist their move history, so
   localStorage and the DB hold the same model.
3. **Resumable games** — ✅ **Multiple** — localStorage keeps all unfinished games; the setup page
   lists them to pick from, with discard.
4. **Autocomplete** — ✅ Native `<datalist>` of existing players (from `stats`); free-typing still
   allowed. (Implemented first; see spec/3.)

### Testing
- Server (pure unit, per spec/3's testing choice): `validate.test.ts` covers `moves` (valid; reject
  out-of-range / duplicate / non-array); `game.test.ts` covers `winnerSymbol` and `deriveResult`
  (decisive X/O, draw, and rejection of unfinished or past-a-win logs) — i.e. the replay-and-verify
  the `POST` handler depends on.
- Client: `storage.test.ts` (jsdom) round-trips the ongoing-game store; `Main.test.tsx` — a move
  writes to localStorage, a fresh render shows the resume list, Resume restores the board/turn,
  finishing posts `moves` and clears the entry, Discard removes it.
- End-to-end (manual — no browser-test harness is pulled in): play → reload → resume → finish →
  confirm stats update, the entry is gone, and `Move` rows land in the DB.
