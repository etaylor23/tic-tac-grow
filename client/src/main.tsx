import React, { useCallback, useEffect, useRef, useState } from 'react'
import { XorO, CellValue } from './types'
import { emptyBoard, winner, isDraw } from './game'
import { Board } from './Board'
import { Stats } from './Stats'
import { postGame, fetchStats, Stat } from './api'

type Phase = 'setup' | 'playing'
type Game = { board: CellValue[], player: XorO }

export const Main = () => {
  const [phase, setPhase] = useState<Phase>('setup')
  const [nameX, setNameX] = useState('')
  const [nameO, setNameO] = useState('')
  const [size, setSize] = useState(3)
  const [k, setK] = useState(3)
  const [game, setGame] = useState<Game>(() => ({ board: emptyBoard(3), player: 'X' }))
  const [stats, setStats] = useState<Stat[]>([])
  const [statsVersion, setStatsVersion] = useState(0)
  const recorded = useRef(false)

  const win = phase === 'playing' ? winner(game.board, size, k) : null
  const draw = phase === 'playing' && isDraw(game.board, win)
  const gameOver = win !== null || draw
  const status = win ? `${win.player} wins!` : draw ? "It's a draw" : `${game.player} to move`

  const canStart = !!nameX.trim() && !!nameO.trim() && nameX.trim() !== nameO.trim()

  const startGame = () => {
    recorded.current = false
    setGame({ board: emptyBoard(size), player: 'X' })
    setPhase('playing')
  }

  const newGame = () => {
    recorded.current = false
    setGame({ board: emptyBoard(size), player: 'X' })
  }

  // stable across moves (deps only change on a new game), so React.memo(Cell) is effective
  const handleCellClick = useCallback((index: number) => {
    setGame(prev => {
      if (prev.board[index] || winner(prev.board, size, k)) return prev
      const board = prev.board.slice()
      board[index] = prev.player
      return { board, player: prev.player === 'X' ? 'O' : 'X' }
    })
  }, [size, k])

  // genuine side effect: persist the result once when a game ends
  useEffect(() => {
    if (!gameOver || recorded.current) return
    recorded.current = true
    postGame({
      players: [{ name: nameX.trim(), symbol: 'X' }, { name: nameO.trim(), symbol: 'O' }],
      boardSize: size,
      winLength: k,
      winnerName: win ? (win.player === 'X' ? nameX.trim() : nameO.trim()) : null,
      isDraw: draw
    }).then(() => setStatsVersion(v => v + 1)).catch(() => {})
  }, [gameOver, win, draw, nameX, nameO, size, k])

  // genuine side effect: load stats on mount and after each recorded game
  useEffect(() => {
    let active = true
    fetchStats().then(s => { if (active) setStats(s) }).catch(() => {})
    return () => { active = false }
  }, [statsVersion])

  return <div className='flex flex-col mt-10 items-center gap-6'>
    <div className='font-bold text-2xl'>Tic Tac Toe</div>

    {phase === 'setup'
      ? <div className='flex flex-col items-center gap-4'>
        <div className='flex gap-4'>
          <label className='flex flex-col text-sm gap-1'>
            Player X
            <input className='border-2 border-gray-900 px-2 py-1' aria-label='Player X name'
              value={nameX} onChange={e => setNameX(e.target.value)} />
          </label>
          <label className='flex flex-col text-sm gap-1'>
            Player O
            <input className='border-2 border-gray-900 px-2 py-1' aria-label='Player O name'
              value={nameO} onChange={e => setNameO(e.target.value)} />
          </label>
        </div>
        <div className='flex gap-8'>
          <label className='flex flex-col items-center text-sm gap-1'>
            Board size: {size}
            <input type='range' min={3} max={15} value={size} aria-label='Board size'
              onChange={e => { const next = Number(e.target.value); setSize(next); setK(Math.min(k, next)) }} />
          </label>
          <label className='flex flex-col items-center text-sm gap-1'>
            Win length: {k}
            <input type='range' min={3} max={size} value={k} aria-label='Win length'
              onChange={e => setK(Number(e.target.value))} />
          </label>
        </div>
        <button type='button' disabled={!canStart} onClick={startGame}
          className='px-4 py-2 border-2 border-gray-900 font-bold disabled:opacity-40'>
          Start
        </button>
      </div>
      : <div className='flex flex-col items-center gap-6'>
        <div role='status' className='text-lg'>{status}</div>
        <Board
          board={game.board}
          size={size}
          winningCells={win ? win.cells : []}
          gameOver={gameOver}
          onCellClick={handleCellClick} />
        <div className='flex gap-4'>
          <button type='button' onClick={newGame}
            className='px-4 py-2 border-2 border-gray-900 font-bold'>New game</button>
          <button type='button' onClick={() => setPhase('setup')}
            className='px-4 py-2 border-2 border-gray-900 font-bold'>Change setup</button>
        </div>
      </div>}

    <div className='mt-4 flex flex-col items-center gap-1'>
      <div className='font-bold'>Stats</div>
      <Stats stats={stats} />
    </div>
  </div>
}
