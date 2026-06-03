import React, { useCallback, useEffect, useRef, useState } from 'react'
import { XorO, CellValue } from './types'
import { emptyBoard, winner, isDraw } from './game'
import { Setup } from './Setup'
import { Play } from './Play'
import { postGame, fetchStats, Stat, OngoingGame } from './api'
import { loadOngoing, saveOngoing, removeOngoing } from './storage'

type Phase = 'setup' | 'playing'
type Game = { board: CellValue[], player: XorO, moves: number[] }

const newId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const Main = () => {
  const [phase, setPhase] = useState<Phase>('setup')
  const [nameX, setNameX] = useState('')
  const [nameO, setNameO] = useState('')
  const [size, setSize] = useState(3)
  const [k, setK] = useState(3)
  const [game, setGame] = useState<Game>(() => ({ board: emptyBoard(3), player: 'X', moves: [] }))
  const [gameId, setGameId] = useState(() => newId())
  const [ongoing, setOngoing] = useState<OngoingGame[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [statsVersion, setStatsVersion] = useState(0)
  const recorded = useRef(false)

  const win = phase === 'playing' ? winner(game.board, size, k) : null
  const draw = phase === 'playing' && isDraw(game.board, win)
  const gameOver = win !== null || draw

  const canStart = !!nameX.trim() && !!nameO.trim() && nameX.trim() !== nameO.trim()

  const resetBoard = () => {
    setGameId(newId())
    recorded.current = false
    setGame({ board: emptyBoard(size), player: 'X', moves: [] })
  }

  const startGame = () => {
    resetBoard()
    setPhase('playing')
  }

  // shrinking the board below the win length drags it down too
  const changeSize = (next: number) => {
    setSize(next)
    setK(prev => Math.min(prev, next))
  }

  const resume = (g: OngoingGame) => {
    setNameX(g.players.find(p => p.symbol === 'X')?.name ?? '')
    setNameO(g.players.find(p => p.symbol === 'O')?.name ?? '')
    setSize(g.boardSize)
    setK(g.winLength)
    const board = emptyBoard(g.boardSize)
    g.moves.forEach((position, i) => { board[position] = i % 2 === 0 ? 'X' : 'O' })
    setGame({ board, player: g.moves.length % 2 === 0 ? 'X' : 'O', moves: g.moves })
    setGameId(g.id)
    recorded.current = false
    setPhase('playing')
  }

  const discard = (id: string) => {
    removeOngoing(id)
    setOngoing(loadOngoing())
  }

  // no deps, so it's stable for the component's life and React.memo(Cell) holds.
  // Post-win/occupied clicks are blocked by Board's `disabled` prop; the occupied
  // guard here is just the reducer keeping its own invariant.
  const handleCellClick = useCallback((index: number) => {
    setGame(prev => {
      if (prev.board[index]) return prev
      const board = prev.board.slice()
      board[index] = prev.player
      return { board, player: prev.player === 'X' ? 'O' : 'X', moves: [...prev.moves, index] }
    })
  }, [])

  // side effect: keep the in-progress game in localStorage as it's played
  useEffect(() => {
    if (phase !== 'playing' || gameOver || game.moves.length === 0) return
    saveOngoing({
      id: gameId,
      players: [{ name: nameX.trim(), symbol: 'X' }, { name: nameO.trim(), symbol: 'O' }],
      boardSize: size,
      winLength: k,
      moves: game.moves,
      updatedAt: new Date().toISOString()
    })
  }, [phase, gameOver, gameId, game.moves, nameX, nameO, size, k])

  // side effect: sync the result once when a game ends, then drop it from localStorage
  useEffect(() => {
    if (!gameOver || recorded.current) return
    recorded.current = true
    postGame({
      players: [{ name: nameX.trim(), symbol: 'X' }, { name: nameO.trim(), symbol: 'O' }],
      boardSize: size,
      winLength: k,
      winnerName: win ? (win.player === 'X' ? nameX.trim() : nameO.trim()) : null,
      isDraw: draw,
      moves: game.moves
    }).then(() => { removeOngoing(gameId); setStatsVersion(v => v + 1) }).catch(() => {})
  }, [gameOver, win, draw, nameX, nameO, size, k, gameId, game.moves])

  // side effect: load stats on mount and after each recorded game
  useEffect(() => {
    let active = true
    fetchStats().then(s => { if (active) setStats(s) }).catch(() => {})
    return () => { active = false }
  }, [statsVersion])

  // side effect: refresh the resume list whenever we return to setup
  useEffect(() => {
    if (phase === 'setup') setOngoing(loadOngoing())
  }, [phase])

  return <div className='flex min-h-screen flex-col items-center gap-8 bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 text-slate-800'>
    <header className='text-center'>
      <h1 className='bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent'>
        Tic Tac Toe
      </h1>
      <p className='mt-1 text-sm text-slate-500'>Set up a match, play, and track the leaderboard.</p>
    </header>

    {phase === 'setup'
      ? <Setup
        nameX={nameX} nameO={nameO} onNameX={setNameX} onNameO={setNameO}
        size={size} onSize={changeSize} k={k} onK={setK}
        canStart={canStart} onStart={startGame}
        ongoing={ongoing} onResume={resume} onDiscard={discard} stats={stats} />
      : <Play
        board={game.board} size={size} k={k}
        win={win} draw={draw} gameOver={gameOver} player={game.player}
        nameX={nameX} nameO={nameO}
        onCellClick={handleCellClick} onNewGame={resetBoard} onChangeSetup={() => setPhase('setup')}
        stats={stats} />}
  </div>
}
