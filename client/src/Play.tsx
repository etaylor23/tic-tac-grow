import React from 'react'
import { CellValue, XorO } from './types'
import { Win } from './game'
import { Stat } from './api'
import { Board } from './Board'
import { Leaderboard } from './Leaderboard'
import { card, primaryBtn, ghostBtn } from './ui'

const TONES = {
  win: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  draw: 'bg-slate-100 text-slate-600 ring-slate-200',
  X: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  O: 'bg-rose-100 text-rose-700 ring-rose-200'
}

type Props = {
  board: CellValue[]
  size: number
  k: number
  win: Win | null
  draw: boolean
  gameOver: boolean
  player: XorO
  nameX: string
  nameO: string
  onCellClick: (index: number) => void
  onNewGame: () => void
  onChangeSetup: () => void
  stats: Stat[]
}

export const Play = ({ board, size, k, win, draw, gameOver, player, nameX, nameO, onCellClick, onNewGame, onChangeSetup, stats }: Props) => {
  const status = win ? `${win.player} wins!` : draw ? "It's a draw" : `${player} to move`
  const statusTone = win ? TONES.win : draw ? TONES.draw : TONES[player]

  return <div className='flex w-full max-w-7xl flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,2fr)_minmax(0,7fr)_minmax(0,3fr)] xl:items-start'>
    <div className='min-w-0'><Leaderboard stats={stats} /></div>
    <div className='min-w-0'>
      <Board
        board={board}
        size={size}
        winningCells={win ? win.cells : []}
        gameOver={gameOver}
        onCellClick={onCellClick} />
    </div>
    <aside className={`${card} flex min-w-0 flex-col gap-4`}>
      <div role='status' className={`rounded-lg px-3 py-2 text-center text-lg font-bold ring-1 ${statusTone}`}>{status}</div>
      <div className='flex flex-col gap-1.5'>
        {([['X', nameX], ['O', nameO]] as const).map(([sym, name]) =>
          <div key={sym} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ring-1 transition ${!gameOver && player === sym ? 'bg-slate-50 ring-slate-300' : 'ring-transparent'}`}>
            <span className={`grid h-6 w-6 place-items-center rounded-md text-sm font-bold text-white ${sym === 'X' ? 'bg-indigo-600' : 'bg-rose-500'}`}>{sym}</span>
            <span className='truncate text-sm font-medium text-slate-700'>{name}</span>
          </div>
        )}
      </div>
      <p className='text-xs text-slate-400'>{size}×{size} board · {k} in a row to win</p>
      <div className='flex flex-col gap-2'>
        <button type='button' onClick={onNewGame} className={`${primaryBtn} w-full`}>New game</button>
        <button type='button' onClick={onChangeSetup} className={`${ghostBtn} w-full`}>Change setup</button>
      </div>
    </aside>
  </div>
}
