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
    className={`aspect-square w-full border-2 border-gray-900 text-xl font-bold flex items-center justify-center disabled:cursor-not-allowed ${isWinning ? 'bg-green-300' : 'bg-white'}`}>
    {value}
  </button>
)
