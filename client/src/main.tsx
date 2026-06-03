import React, { useCallback, useEffect, useRef, useState } from 'react'
import { XorO, CellValue } from './types'
import { emptyBoard, winner, isDraw } from './game'
import { Board } from './Board'
import { Stats } from './Stats'
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
  const status = win ? `${win.player} wins!` : draw ? "It's a draw" : `${game.player} to move`

  const canStart = !!nameX.trim() && !!nameO.trim() && nameX.trim() !== nameO.trim()

  const startGame = () => {
    setGameId(newId())
    recorded.current = false
    setGame({ board: emptyBoard(size), player: 'X', moves: [] })
    setPhase('playing')
  }

  const newGame = () => {
    setGameId(newId())
    recorded.current = false
    setGame({ board: emptyBoard(size), player: 'X', moves: [] })
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

  // stable across moves (deps only change on a new game), so React.memo(Cell) is effective
  const handleCellClick = useCallback((index: number) => {
    setGame(prev => {
      if (prev.board[index] || winner(prev.board, size, k)) return prev
      const board = prev.board.slice()
      board[index] = prev.player
      return { board, player: prev.player === 'X' ? 'O' : 'X', moves: [...prev.moves, index] }
    })
  }, [size, k])

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

  const statusTone = win
    ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
    : draw
      ? 'bg-slate-100 text-slate-600 ring-slate-200'
      : game.player === 'X'
        ? 'bg-indigo-100 text-indigo-700 ring-indigo-200'
        : 'bg-rose-100 text-rose-700 ring-rose-200'

  const primaryBtn = 'rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40'
  const ghostBtn = 'rounded-lg bg-white px-4 py-2 font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50'
  const card = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200'

  const leaderboard =
    <section className={`${card} flex flex-col gap-3`}>
      <h2 className='text-lg font-bold'>Leaderboard</h2>
      <Stats stats={stats} />
    </section>

  return <div className='flex min-h-screen flex-col items-center gap-8 bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 text-slate-800'>
    <header className='text-center'>
      <h1 className='bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent'>
        Tic Tac Toe
      </h1>
      <p className='mt-1 text-sm text-slate-500'>Set up a match, play, and track the leaderboard.</p>
    </header>

    {phase === 'setup'
      ? <div className='flex w-full max-w-md flex-col gap-5'>
        {ongoing.length > 0 &&
          <section className={`${card} flex flex-col gap-3`}>
            <h2 className='text-lg font-bold'>Resume a game</h2>
            <ul className='flex flex-col gap-2'>
              {ongoing.map(g =>
                <li key={g.id} className='flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200'>
                  <span className='text-slate-500'>
                    <span className='font-semibold text-slate-800'>
                      {g.players.find(p => p.symbol === 'X')?.name} vs {g.players.find(p => p.symbol === 'O')?.name}
                    </span>
                    {' · '}{g.boardSize}×{g.boardSize} · {g.winLength} in a row · {g.moves.length} moves
                  </span>
                  <span className='flex shrink-0 gap-2'>
                    <button type='button' onClick={() => resume(g)} className='rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-500'>Resume</button>
                    <button type='button' onClick={() => discard(g.id)} className='rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800'>Discard</button>
                  </span>
                </li>
              )}
            </ul>
          </section>}

        <section className={`${card} flex flex-col gap-5`}>
          <h2 className='text-lg font-bold'>Game setup</h2>
          <div className='grid grid-cols-2 gap-4'>
            <label className='flex flex-col gap-1.5 text-sm font-medium text-slate-600'>
              <span className='flex items-center gap-1.5'>
                <span className='grid h-5 w-5 place-items-center rounded bg-indigo-600 text-xs font-bold text-white'>X</span> Player X
              </span>
              <input className='rounded-lg px-3 py-2 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-indigo-500'
                aria-label='Player X name' list='known-players' value={nameX} onChange={e => setNameX(e.target.value)} />
            </label>
            <label className='flex flex-col gap-1.5 text-sm font-medium text-slate-600'>
              <span className='flex items-center gap-1.5'>
                <span className='grid h-5 w-5 place-items-center rounded bg-rose-500 text-xs font-bold text-white'>O</span> Player O
              </span>
              <input className='rounded-lg px-3 py-2 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-rose-400'
                aria-label='Player O name' list='known-players' value={nameO} onChange={e => setNameO(e.target.value)} />
            </label>
            <datalist id='known-players'>
              {stats.map(s => <option key={s.name} value={s.name} />)}
            </datalist>
          </div>
          <div className='flex flex-col gap-3'>
            <label className='flex flex-col gap-1 text-sm font-medium text-slate-600'>
              <span className='flex justify-between'>Board size <span className='font-bold text-slate-800'>{size}×{size}</span></span>
              <input type='range' min={3} max={15} value={size} aria-label='Board size' className='accent-indigo-600'
                onChange={e => { const next = Number(e.target.value); setSize(next); setK(Math.min(k, next)) }} />
            </label>
            <label className='flex flex-col gap-1 text-sm font-medium text-slate-600'>
              <span className='flex justify-between'>Win length <span className='font-bold text-slate-800'>{k} in a row</span></span>
              <input type='range' min={3} max={size} value={k} aria-label='Win length' className='accent-indigo-600'
                onChange={e => setK(Number(e.target.value))} />
            </label>
          </div>
          <button type='button' disabled={!canStart} onClick={startGame} className={`${primaryBtn} w-full`}>Start</button>
        </section>
        {leaderboard}
      </div>
      : <div className='flex w-full max-w-7xl flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,2fr)_minmax(0,7fr)_minmax(0,3fr)] xl:items-start'>
        <div className='min-w-0'>{leaderboard}</div>
        <div className='min-w-0'>
          <Board
            board={game.board}
            size={size}
            winningCells={win ? win.cells : []}
            gameOver={gameOver}
            onCellClick={handleCellClick} />
        </div>
        <aside className={`${card} flex min-w-0 flex-col gap-4`}>
          <div role='status' className={`rounded-lg px-3 py-2 text-center text-lg font-bold ring-1 ${statusTone}`}>{status}</div>
          <div className='flex flex-col gap-1.5'>
            {([['X', nameX], ['O', nameO]] as const).map(([sym, name]) =>
              <div key={sym} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ring-1 transition ${!gameOver && game.player === sym ? 'bg-slate-50 ring-slate-300' : 'ring-transparent'}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-md text-sm font-bold text-white ${sym === 'X' ? 'bg-indigo-600' : 'bg-rose-500'}`}>{sym}</span>
                <span className='truncate text-sm font-medium text-slate-700'>{name}</span>
              </div>
            )}
          </div>
          <p className='text-xs text-slate-400'>{size}×{size} board · {k} in a row to win</p>
          <div className='flex flex-col gap-2'>
            <button type='button' onClick={newGame} className={`${primaryBtn} w-full`}>New game</button>
            <button type='button' onClick={() => setPhase('setup')} className={`${ghostBtn} w-full`}>Change setup</button>
          </div>
        </aside>
      </div>}
  </div>
}
