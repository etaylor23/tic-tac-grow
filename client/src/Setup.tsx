import React from 'react'
import { Stat, OngoingGame } from './api'
import { Leaderboard } from './Leaderboard'
import { card, primaryBtn } from './ui'

type Props = {
  nameX: string
  nameO: string
  onNameX: (name: string) => void
  onNameO: (name: string) => void
  size: number
  onSize: (size: number) => void
  k: number
  onK: (k: number) => void
  canStart: boolean
  onStart: () => void
  ongoing: OngoingGame[]
  onResume: (game: OngoingGame) => void
  onDiscard: (id: string) => void
  stats: Stat[]
}

export const Setup = ({ nameX, nameO, onNameX, onNameO, size, onSize, k, onK, canStart, onStart, ongoing, onResume, onDiscard, stats }: Props) =>
  <div className='flex w-full max-w-md flex-col gap-5'>
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
                <button type='button' onClick={() => onResume(g)} className='rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-500'>Resume</button>
                <button type='button' onClick={() => onDiscard(g.id)} className='rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800'>Discard</button>
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
            aria-label='Player X name' list='known-players' value={nameX} onChange={e => onNameX(e.target.value)} />
        </label>
        <label className='flex flex-col gap-1.5 text-sm font-medium text-slate-600'>
          <span className='flex items-center gap-1.5'>
            <span className='grid h-5 w-5 place-items-center rounded bg-rose-500 text-xs font-bold text-white'>O</span> Player O
          </span>
          <input className='rounded-lg px-3 py-2 ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-rose-400'
            aria-label='Player O name' list='known-players' value={nameO} onChange={e => onNameO(e.target.value)} />
        </label>
        <datalist id='known-players'>
          {stats.map(s => <option key={s.name} value={s.name} />)}
        </datalist>
      </div>
      <div className='flex flex-col gap-3'>
        <label className='flex flex-col gap-1 text-sm font-medium text-slate-600'>
          <span className='flex justify-between'>Board size <span className='font-bold text-slate-800'>{size}×{size}</span></span>
          <input type='range' min={3} max={15} value={size} aria-label='Board size' className='accent-indigo-600'
            onChange={e => onSize(Number(e.target.value))} />
        </label>
        <label className='flex flex-col gap-1 text-sm font-medium text-slate-600'>
          <span className='flex justify-between'>Win length <span className='font-bold text-slate-800'>{k} in a row</span></span>
          <input type='range' min={3} max={size} value={k} aria-label='Win length' className='accent-indigo-600'
            onChange={e => onK(Number(e.target.value))} />
        </label>
      </div>
      <button type='button' disabled={!canStart} onClick={onStart} className={`${primaryBtn} w-full`}>Start</button>
    </section>
    <Leaderboard stats={stats} />
  </div>
