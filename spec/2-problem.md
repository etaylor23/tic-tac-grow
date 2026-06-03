# Problem 2 — Scalable board

## Requirement
- Make the board scalable to any size.
- Add an input to change the board size.
- Size is a number between 3 and 15 (inclusive).

## Deep dive

### The pivotal decision: what is a win on a larger board?
The brief scales the *size* but not the *win rule*. Two coherent readings:
- **Full line of N** — a whole row, column, or main diagonal of one symbol. The literal
  generalisation of 3×3 (where a line already spans the whole board). Trivial code. Downside:
  on big boards games almost always end in a draw — technically correct, not very fun.
- **k-in-a-row** (e.g. always 3, or 5 like Gomoku) regardless of N — the classic "m,n,k-game".
  Far more playable on large boards, but needs sliding windows over *every* diagonal (not just
  the two main ones), so meaningfully more code.

This single choice shapes the win-detection code and the feel of the game. It must be your call.

### Win detection generalisation
- **Full line of N:** lines = N rows + N columns + 2 diagonals = `2N + 2` lines, each length N.
  Check each for a single non-empty symbol. O(N²), trivial up to 15×15 (225 cells).
- **k-in-a-row:** enumerate all maximal lines in 4 directions and slide a window of `k`. More
  enumeration, more edge handling.

### Resetting on size change — without an effect
Changing size must start a fresh board (you can't map a 3×3 game onto 5×5). The clean shape is
a single `newGame(size)` that sets **both** size and a fresh empty board, called from the size
input's handler and from the restart button. **Do not** use a `useEffect` that watches `size`
to reset the board — that is exactly the derived-side-effect anti-pattern CLAUDE.md forbids.

### Input control
- **Number input** with `min=3 max=15`, clamped on change. Simplest and accessible.
- Range slider (shows the value as it moves) or +/- stepper are alternatives.
Validation: clamp out-of-range and ignore non-numeric input.

### Layout
A 3–15 wide grid scales cleanly with CSS Grid. Tailwind can't emit an arbitrary
`repeat(N, …)` at runtime without safelisting, so set `gridTemplateColumns` via an inline
style and use Tailwind for everything else. (The scaffold's nested flex rows also work but read
worse at scale.)

### Hooks at scale (where memoisation earns its place)
A 15×15 board is 225 cells re-rendering on every move. This is the first point where
optimisation is *justified* rather than cargo-culted:
- `React.memo(Cell)` + a stable `onCellClick` via `useCallback` so only the changed cell
  re-renders. Defensible, and a good place to leave a one-line "why".
- `useMemo` on the winner: still sub-millisecond at 225 cells, so optional. Use it only if it
  reads more clearly, not reflexively.

### UX
Show the current size; keep cells a sensible size as N grows (cap cell size / allow the grid to
shrink). Resetting mid-game is expected when the size changes.

## Decisions (locked)
1. **Win condition** — ✅ **Configurable k-in-a-row.** The player sets win length `k` when
   starting a game, constrained `3 ≤ k ≤ size`; if size drops below `k`, clamp `k` down. One
   `winner(board, size, k)` serves the whole app (Problem 1 = size 3, k 3).
2. **Size input** — ✅ **Range slider** (3–15).
3. **Resize timing** — ✅ **Anytime.** Changing size *or* `k` starts a fresh board via a single
   `newGame(size, k)` handler — never an effect.
4. **Memoisation** — ✅ **`React.memo(Cell)` + `useCallback` onClick**, justified by 15×15
   scale, with a one-line note on why.
5. **Layout** — ✅ **CSS Grid** via inline `gridTemplateColumns` (default).

### Implications of configurable k
- Add a `k` control (slider matching the size one, range `3…size`, default `3`) alongside the
  board. Both are game-setup params: changing either starts a new game.
- Win detection becomes a sliding window of length `k` over all four directions (horizontal,
  vertical, both diagonals) — not just full lines.
- `winner()` returns the winning run's cells so the UI highlights exactly the `k` cells that won.
- Draw = board full with no run of `k`.
