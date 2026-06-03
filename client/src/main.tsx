import React, { useCallback, useState } from 'react'
import { XorO, CellValue } from './types'
import { emptyBoard, winner, isDraw } from './game'
import { Board } from './Board'

type Game = { board: CellValue[], player: XorO }

export const Main = () => {
  const [size, setSize] = useState(3)
  const [k, setK] = useState(3)
  const [game, setGame] = useState<Game>(() => ({ board: emptyBoard(3), player: 'X' }))

  const newGame = useCallback((nextSize: number, nextK: number) => {
    setSize(nextSize)
    setK(nextK)
    setGame({ board: emptyBoard(nextSize), player: 'X' })
  }, [])

  // stable across moves (deps only change on a new game), so React.memo(Cell) is effective
  const handleCellClick = useCallback((index: number) => {
    setGame(prev => {
      if (prev.board[index] || winner(prev.board, size, k)) return prev
      const board = prev.board.slice()
      board[index] = prev.player
      return { board, player: prev.player === 'X' ? 'O' : 'X' }
    })
  }, [size, k])

  const win = winner(game.board, size, k)
  const draw = isDraw(game.board, win)
  const gameOver = win !== null || draw
  const status = win ? `${win.player} wins!` : draw ? "It's a draw" : `${game.player} to move`

  return <div className='flex flex-col mt-10 items-center gap-6'>
    <div className='font-bold text-2xl'>Tic Tac Toe</div>

    <div className='flex gap-8'>
      <label className='flex flex-col items-center text-sm gap-1'>
        Board size: {size}
        <input
          type='range'
          min={3}
          max={15}
          value={size}
          aria-label='Board size'
          onChange={e => {
            const next = Number(e.target.value)
            newGame(next, Math.min(k, next))
          }} />
      </label>
      <label className='flex flex-col items-center text-sm gap-1'>
        Win length: {k}
        <input
          type='range'
          min={3}
          max={size}
          value={k}
          aria-label='Win length'
          onChange={e => newGame(size, Number(e.target.value))} />
      </label>
    </div>

    <div role='status' className='text-lg'>{status}</div>

    <Board
      board={game.board}
      size={size}
      winningCells={win ? win.cells : []}
      gameOver={gameOver}
      onCellClick={handleCellClick} />

    <button
      type='button'
      onClick={() => newGame(size, k)}
      className='px-4 py-2 border-2 border-gray-900 font-bold'>
      New game
    </button>
  </div>
}
