import { computeStats } from './stats'

const players = [{ id: 1, name: 'Ada' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Cara' }]
const games = [
  { winnerId: 1, isDraw: false, playerIds: [1, 2] }, // Ada beats Bob
  { winnerId: 2, isDraw: false, playerIds: [1, 2] }, // Bob beats Ada
  { winnerId: null, isDraw: true, playerIds: [1, 2] }, // draw
  { winnerId: 1, isDraw: false, playerIds: [1, 3] } // Ada beats Cara
]

describe('computeStats', () => {
  it('tallies wins, losses, draws and played per player, ranked by wins', () => {
    expect(computeStats(players, games)).toEqual([
      { name: 'Ada', wins: 2, losses: 1, draws: 1, played: 4 },
      { name: 'Bob', wins: 1, losses: 1, draws: 1, played: 3 },
      { name: 'Cara', wins: 0, losses: 1, draws: 0, played: 1 }
    ])
  })

  it('only counts games a player took part in', () => {
    expect(computeStats(players, games).find(s => s.name === 'Cara'))
      .toEqual({ name: 'Cara', wins: 0, losses: 1, draws: 0, played: 1 })
  })

  it('returns an empty list when there are no players', () => {
    expect(computeStats([], games)).toEqual([])
  })
})
