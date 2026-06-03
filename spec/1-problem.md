# Problem 1 — Basic game

## Requirement
- Implement a complete basic game of Tic-Tac-Toe.
- React + TypeScript throughout; extend the provided Tailwind.
- Both players play from the same app — switch the current player on each move.
- Once a game completes, allow starting another.

## Build note
The pure engine in `game.ts` is general (`size`, `k`) from the start; Problem 1's UI simply
fixes `size 3, k 3` until Problem 2 exposes the sliders. No win logic is rewritten later.

## Deep dive

### Single source of truth
The board is the only real state. Everything else is **derived** from it:
- **Current player** — X moves first, so count filled cells: even → X's turn, odd → O's turn.
- **Winner** — scan the lines for one symbol filling a full line.
- **Draw** — board full and no winner.
- **Game over** — winner or draw.

Per CLAUDE.md this means: no `useEffect` in Problem 1 (there is no external side effect), and
no winner/turn/draw mirrored into state. State = `board`. This is the headline thing the
hooks rules are protecting.

### Board representation
- **1D flat array** (`length = size²`): cleaner to generate win-lines by index math, and
  scales painlessly to Problem 2. Row `r`, col `c` → index `r * size + c`.
- **2D nested array** (current scaffold, `(XorO | undefined)[][]`): maps literally to the
  grid, but win-line generation and resizing get fiddlier.

### Win detection (3×3)
Eight lines: 3 rows, 3 columns, 2 diagonals. A line wins if all its cells share one
non-empty symbol. Build the line index sets once; reuse for the winner check and for
highlighting. (This generalises directly in Problem 2.)

### Move handling
On cell click: ignore if the cell is filled or the game is over; otherwise write the current
player's symbol at that index, returning a **new** board (no mutation).

### Restart
A "New game" action resets the board to empty. Either always visible, or surfaced alongside
the result when the game ends.

### Logic vs components
Keep pure logic in a `game.ts` module — `emptyBoard(size)`, `lines(size)`,
`winner(board)`, `isDraw(board)`, `currentPlayer(board)`. Components stay thin and call into
it. This also makes the logic unit-testable under the existing node Jest setup.

### Hooks (the graded surface)
- `useEffect`: **none** — nothing external happens in Problem 1.
- `useMemo`: not warranted at 3×3 (winner check is ~8 line scans). Avoid premature
  memoisation; revisit only if Problem 2 scale justifies it.
- `useCallback`: only worth it paired with a memoised `Cell`. Not justified at this size —
  defer to Problem 2 where a 15×15 board gives genuine cover.

### Testing
Unit-test `game.ts`: wins on every row/column/both diagonals, draw detection, and
`currentPlayer` alternation. High value, low effort, fits the node Jest config.

### Edge cases
Click on a filled cell → ignore. Click after game over → ignore. First move is always X.

## Decisions (locked)
1. **Board representation** — ✅ **1D flat array** (`length = size²`; row `r`, col `c` →
   index `r * size + c`).
2. **Current player** — ✅ **Store in state, toggle per move.** Toggled inside the click
   handler (never an effect); reset to `X` on new game. (Problem 2 combines this with the board
   into one `{ board, player }` state so the click handler stays stable for `React.memo`.)
3. **Componentisation** — ✅ **`Board` + `Cell`.** `Main` owns state; `Board` renders the
   grid; `Cell` is a single square (sets up `React.memo` for Problem 2).
4. **UX scope** — ✅ all four: turn indicator, result banner, highlight the winning line,
   lock filled / finished cells.
