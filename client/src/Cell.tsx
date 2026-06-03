import React from 'react'
import { CellValue } from './types'

type Props = {
  value: CellValue
  index: number
  isWinning: boolean
  disabled: boolean
  onClick: (index: number) => void
}

// memoised so a move only re-renders the changed cell, not the whole (up to 15x15) board
export const Cell = React.memo(({ value, index, isWinning, disabled, onClick }: Props) =>
  <button
    type='button'
    onClick={() => onClick(index)}
    disabled={disabled}
    className={`relative aspect-square w-full overflow-hidden rounded-md ring-1 transition-colors [container-type:inline-size] ${
      isWinning ? 'bg-emerald-200 ring-emerald-400' : 'bg-white ring-slate-200 enabled:hover:bg-slate-50'
    }`}>
    <span className={`absolute inset-0 flex items-center justify-center text-[55cqw] font-bold leading-none ${value === 'X' ? 'text-indigo-600' : 'text-rose-500'}`}>{value}</span>
  </button>
)
