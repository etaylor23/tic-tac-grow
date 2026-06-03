import React from 'react'
import { CellValue } from './types'

type Props = {
  value: CellValue
  isWinning: boolean
  disabled: boolean
  onClick: () => void
}

export const Cell = ({ value, isWinning, disabled, onClick }: Props) =>
  <button
    type='button'
    onClick={onClick}
    disabled={disabled}
    className={`w-16 h-16 border-2 border-gray-900 text-2xl font-bold flex items-center justify-center disabled:cursor-not-allowed ${isWinning ? 'bg-green-300' : 'bg-white'}`}>
    {value}
  </button>
