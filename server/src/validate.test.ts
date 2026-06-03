import { parseGameBody } from './validate'

const valid = {
  players: [{ name: 'Ada', symbol: 'X' }, { name: 'Bob', symbol: 'O' }],
  boardSize: 3,
  winLength: 3,
  winnerName: 'Ada',
  isDraw: false
}

describe('parseGameBody', () => {
  it('accepts a valid decisive game', () => {
    expect(parseGameBody(valid)).toEqual(valid)
  })

  it('accepts a draw with no winner', () => {
    const draw = { ...valid, winnerName: null, isDraw: true }
    expect(parseGameBody(draw)).toEqual(draw)
  })

  it('rejects an invalid symbol', () => {
    expect(() => parseGameBody({ ...valid, players: [{ name: 'Ada', symbol: 'Z' }, { name: 'Bob', symbol: 'O' }] })).toThrow()
  })

  it('rejects a blank name', () => {
    expect(() => parseGameBody({ ...valid, players: [{ name: '  ', symbol: 'X' }, { name: 'Bob', symbol: 'O' }] })).toThrow()
  })

  it('rejects when there are not exactly two players', () => {
    expect(() => parseGameBody({ ...valid, players: [{ name: 'Ada', symbol: 'X' }] })).toThrow()
  })

  it('rejects an out-of-range board size', () => {
    expect(() => parseGameBody({ ...valid, boardSize: 2 })).toThrow()
    expect(() => parseGameBody({ ...valid, boardSize: 16 })).toThrow()
  })

  it('rejects a win length greater than the board size', () => {
    expect(() => parseGameBody({ ...valid, winLength: 4 })).toThrow()
  })

  it('rejects a winnerName that is not one of the players', () => {
    expect(() => parseGameBody({ ...valid, winnerName: 'Zoe' })).toThrow()
  })

  it('rejects a non-boolean isDraw', () => {
    expect(() => parseGameBody({ ...valid, isDraw: 'nope' })).toThrow()
  })
})
