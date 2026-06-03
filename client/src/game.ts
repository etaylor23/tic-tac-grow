import { XorO, CellValue } from './types'

export type Win = { player: XorO, cells: number[] }

export const emptyBoard = (size: number): CellValue[] =>
  new Array<CellValue>(size * size).fill(undefined)

// horizontal, vertical, diagonal ↘, diagonal ↙
const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]]

// Scans every cell as the start of a length-k run in each direction. The (r, c)
// grid walk with bounds-checked endpoints keeps runs inside one line, so they
// never wrap across a row edge. General for any size and k (3 ≤ k ≤ size).
export const winner = (board: CellValue[], size: number, k: number): Win | null => {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const player = board[r * size + c]
      if (!player) continue
      for (const [dr, dc] of DIRECTIONS) {
        const endR = r + dr * (k - 1)
        const endC = c + dc * (k - 1)
        if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue
        const cells: number[] = []
        let won = true
        for (let i = 0; i < k; i++) {
          const index = (r + dr * i) * size + (c + dc * i)
          if (board[index] !== player) { won = false; break }
          cells.push(index)
        }
        if (won) return { player, cells }
      }
    }
  }
  return null
}

export const isDraw = (board: CellValue[], win: Win | null): boolean =>
  !win && board.every(cell => cell !== undefined)
