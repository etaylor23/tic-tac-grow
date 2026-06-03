import React, { useState } from 'react'
import { XorO } from './types'
import { emptyBoard, winner, isDraw } from './game'
import { Board } from './Board'

const SIZE = 3
const K = 3

export const Main = () => {
  const [board, setBoard] = useState(() => emptyBoard(SIZE))
  const [currentPlayer, setCurrentPlayer] = useState<XorO>('X')

  const win = winner(board, SIZE, K)
  const draw = isDraw(board, win)
  const gameOver = win !== null || draw
  const status = win ? `${win.player} wins!` : draw ? "It's a draw" : `${currentPlayer} to move`

  const handleCellClick = (index: number) => {
    if (gameOver || board[index]) return
    const next = board.slice()
    next[index] = currentPlayer
    setBoard(next)
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
  }

  const newGame = () => {
    setBoard(emptyBoard(SIZE))
    setCurrentPlayer('X')
  }

  return <div className='flex flex-col mt-10 items-center gap-6'>
    <div className='font-bold text-2xl'>Tic Tac Toe</div>
    <div role='status' className='text-lg'>{status}</div>
    <Board
      board={board}
      size={SIZE}
      winningCells={win ? win.cells : []}
      gameOver={gameOver}
      onCellClick={handleCellClick} />
    <button
      type='button'
      onClick={newGame}
      className='px-4 py-2 border-2 border-gray-900 font-bold'>
      New game
    </button>
  </div>
}
