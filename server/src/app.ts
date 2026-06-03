import express from 'express'
import { prisma } from './db'
import { parseGameBody, GamePayload } from './validate'
import { computeStats } from './stats'

export const app = express()
app.use(express.json())

app.post('/api/games', async (req, res) => {
  let payload: GamePayload
  try {
    payload = parseGameBody(req.body)
  } catch (e) {
    res.status(400).json({ error: (e as Error).message })
    return
  }
  try {
    const game = await prisma.$transaction(async (tx) => {
      const players = await Promise.all(payload.players.map(p =>
        tx.player.upsert({ where: { name: p.name }, update: {}, create: { name: p.name } })
      ))
      const xId = players[payload.players.findIndex(p => p.symbol === 'X')].id
      const oId = players[payload.players.findIndex(p => p.symbol === 'O')].id
      const winner = payload.winnerName
        ? await tx.player.findUniqueOrThrow({ where: { name: payload.winnerName } })
        : null
      return tx.game.create({
        data: {
          boardSize: payload.boardSize,
          winLength: payload.winLength,
          isDraw: payload.isDraw,
          winnerId: winner?.id ?? null,
          players: {
            create: payload.players.map(p => ({
              symbol: p.symbol,
              player: { connect: { name: p.name } }
            }))
          },
          moves: {
            // X plays the even moves, O the odd ones
            create: payload.moves.map((position, i) => ({
              position,
              moveNumber: i,
              player: { connect: { id: i % 2 === 0 ? xId : oId } }
            }))
          }
        }
      })
    })
    res.status(201).json({ id: game.id })
  } catch {
    res.status(500).json({ error: 'failed to save game' })
  }
})

app.get('/api/stats', async (_req, res) => {
  try {
    const [players, games] = await Promise.all([
      prisma.player.findMany({ select: { id: true, name: true } }),
      prisma.game.findMany({ select: { winnerId: true, isDraw: true, players: { select: { playerId: true } } } })
    ])
    res.json(computeStats(
      players,
      games.map(g => ({ winnerId: g.winnerId, isDraw: g.isDraw, playerIds: g.players.map(gp => gp.playerId) }))
    ))
  } catch {
    res.status(500).json({ error: 'failed to load stats' })
  }
})
