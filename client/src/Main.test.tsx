/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Main } from './main'

const status = () => screen.getByRole('status').textContent
const cells = () => screen.getAllByRole('button').filter(b => b.textContent !== 'New game')
const newGame = () => screen.getByRole('button', { name: 'New game' })

describe('Main', () => {
  it('alternates X and O and reports whose turn it is', () => {
    render(<Main />)
    expect(status()).toBe('X to move')
    fireEvent.click(cells()[0])
    expect(cells()[0].textContent).toBe('X')
    expect(status()).toBe('O to move')
    fireEvent.click(cells()[1])
    expect(cells()[1].textContent).toBe('O')
    expect(status()).toBe('X to move')
  })

  it('ignores clicks on an occupied cell', () => {
    render(<Main />)
    fireEvent.click(cells()[0])
    fireEvent.click(cells()[0])
    expect(cells()[0].textContent).toBe('X')
    expect(status()).toBe('O to move')
  })

  it('announces a win and locks the board', () => {
    render(<Main />)
    ;[0, 3, 1, 4, 2].forEach(i => fireEvent.click(cells()[i])) // X: 0,1,2  O: 3,4
    expect(status()).toBe('X wins!')
    fireEvent.click(cells()[5]) // locked
    expect(cells()[5].textContent).toBe('')
  })

  it('resets to a fresh game on New game', () => {
    render(<Main />)
    ;[0, 3, 1, 4, 2].forEach(i => fireEvent.click(cells()[i]))
    fireEvent.click(newGame())
    expect(cells().every(c => c.textContent === '')).toBe(true)
    expect(status()).toBe('X to move')
  })

  it('announces a draw on a full board with no winner', () => {
    render(<Main />)
    ;[0, 1, 2, 4, 3, 5, 7, 6, 8].forEach(i => fireEvent.click(cells()[i]))
    expect(status()).toBe("It's a draw")
  })
})
