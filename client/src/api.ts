export type Stat = { name: string, wins: number, losses: number, draws: number, played: number }

export type GamePayload = {
  players: { name: string, symbol: 'X' | 'O' }[]
  boardSize: number
  winLength: number
  winnerName: string | null
  isDraw: boolean
}

export const postGame = async (payload: GamePayload): Promise<void> => {
  await fetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export const fetchStats = async (): Promise<Stat[]> => {
  const res = await fetch('/api/stats')
  return res.json()
}
