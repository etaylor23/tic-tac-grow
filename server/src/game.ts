export type XorO = 'X' | 'O'
type CellValue = XorO | undefined

export type Result = { winner: XorO | null, isDraw: boolean }

// horizontal, vertical, diagonal ↘, diagonal ↙
const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]]

// Mirror of the client's winner(): scans every cell as the start of a length-k
// run, with bounds-checked endpoints so runs never wrap a row edge. The two
// packages can't share a build without extra tooling, so the ~20 lines live in
// both. Returns the winning symbol, or null.
export const winnerSymbol = (board: CellValue[], size: number, k: number): XorO | null => {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const player = board[r * size + c]
      if (!player) continue
      for (const [dr, dc] of DIRECTIONS) {
        const endR = r + dr * (k - 1)
        const endC = c + dc * (k - 1)
        if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue
        let won = true
        for (let i = 1; i < k; i++) {
          if (board[(r + dr * i) * size + (c + dc * i)] !== player) { won = false; break }
        }
        if (won) return player
      }
    }
  }
  return null
}

// The move log is the source of truth: replay it (even plies are X, odd are O)
// and read off the terminal result. Throws when the log isn't a legally
// finished game, so a client can't record a win that never happened.
export const deriveResult = (moves: number[], size: number, k: number): Result => {
  const board: CellValue[] = new Array<CellValue>(size * size).fill(undefined)
  let wonBeforeLast: XorO | null = null
  moves.forEach((position, i) => {
    if (i === moves.length - 1) wonBeforeLast = winnerSymbol(board, size, k)
    board[position] = i % 2 === 0 ? 'X' : 'O'
  })
  if (wonBeforeLast) throw new Error('move log continues past a win')
  const winner = winnerSymbol(board, size, k)
  const full = moves.length === size * size
  if (!winner && !full) throw new Error('move log is not a finished game')
  return { winner, isDraw: !winner && full }
}
