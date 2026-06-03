import { winnerSymbol, deriveResult, XorO } from './game'

// build a flat board from { index: symbol } pairs
const build = (size: number, marks: Record<number, XorO>): (XorO | undefined)[] => {
  const board = new Array<XorO | undefined>(size * size).fill(undefined)
  for (const [i, s] of Object.entries(marks)) board[Number(i)] = s
  return board
}

describe('winnerSymbol', () => {
  it('finds a horizontal run', () => {
    expect(winnerSymbol(build(3, { 0: 'X', 1: 'X', 2: 'X' }), 3, 3)).toBe('X')
  })

  it('returns null with no run', () => {
    expect(winnerSymbol(build(3, { 0: 'X', 1: 'O', 2: 'X' }), 3, 3)).toBeNull()
  })

  it('does not wrap across a row edge', () => {
    // indices 2,3,4 are adjacent in the flat array but span rows 0 and 1
    expect(winnerSymbol(build(3, { 2: 'X', 3: 'X', 4: 'X' }), 3, 3)).toBeNull()
  })

  it('finds a k-run on a larger board', () => {
    expect(winnerSymbol(build(5, { 6: 'O', 12: 'O', 18: 'O' }), 5, 3)).toBe('O')
  })
})

describe('deriveResult', () => {
  it('reads a decisive game off the move log', () => {
    // X takes the top row (plies 0,2,4 → positions 0,1,2)
    expect(deriveResult([0, 3, 1, 4, 2], 3, 3)).toEqual({ winner: 'X', isDraw: false })
  })

  it('reads an O win off the move log', () => {
    // O takes the top row (plies 1,3,5 → positions 0,1,2)
    expect(deriveResult([3, 0, 4, 1, 8, 2], 3, 3)).toEqual({ winner: 'O', isDraw: false })
  })

  it('reads a full-board draw', () => {
    expect(deriveResult([0, 1, 2, 4, 3, 5, 7, 6, 8], 3, 3)).toEqual({ winner: null, isDraw: true })
  })

  it('rejects a log that is not yet finished', () => {
    expect(() => deriveResult([0, 3, 1], 3, 3)).toThrow('not a finished game')
  })

  it('rejects a log that continues past a win', () => {
    expect(() => deriveResult([0, 3, 1, 4, 2, 5], 3, 3)).toThrow('continues past a win')
  })
})
