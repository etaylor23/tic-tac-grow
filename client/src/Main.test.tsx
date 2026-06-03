/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Main } from './main'

const status = () => screen.getByRole('status').textContent
const cells = () => screen.getAllByRole('button').filter(b => b.textContent !== 'New game')
const newGame = () => screen.getByRole('button', { name: 'New game' })
const sizeSlider = () => screen.getByRole('slider', { name: 'Board size' }) as HTMLInputElement
const winLengthSlider = () => screen.getByRole('slider', { name: 'Win length' }) as HTMLInputElement
const setSlider = (slider: HTMLInputElement, value: number) =>
  fireEvent.change(slider, { target: { value: String(value) } })

describe('Main — basic game', () => {
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

describe('Main — scalable board', () => {
  it('resizes the board and resets it when the size slider changes', () => {
    render(<Main />)
    fireEvent.click(cells()[0])
    setSlider(sizeSlider(), 5)
    expect(cells()).toHaveLength(25)
    expect(cells().every(c => c.textContent === '')).toBe(true)
    expect(status()).toBe('X to move')
  })

  it('resets the board when the win-length slider changes', () => {
    render(<Main />)
    setSlider(sizeSlider(), 5)
    fireEvent.click(cells()[0])
    setSlider(winLengthSlider(), 4)
    expect(cells().every(c => c.textContent === '')).toBe(true)
    expect(status()).toBe('X to move')
  })

  it('detects a k-in-a-row win on a larger board', () => {
    render(<Main />)
    setSlider(sizeSlider(), 5) // size 5, k 3
    ;[0, 5, 1, 6, 2].forEach(i => fireEvent.click(cells()[i])) // X: 0,1,2 row  O: 5,6
    expect(status()).toBe('X wins!')
  })

  it('bounds the sliders: size 3–15, win length capped at the board size', () => {
    render(<Main />)
    expect(sizeSlider().min).toBe('3')
    expect(sizeSlider().max).toBe('15')
    setSlider(sizeSlider(), 5)
    expect(winLengthSlider().max).toBe('5')
  })

  it('clamps win length down when the size drops below it', () => {
    render(<Main />)
    setSlider(sizeSlider(), 5)
    setSlider(winLengthSlider(), 5)
    expect(winLengthSlider().value).toBe('5')
    setSlider(sizeSlider(), 3)
    expect(winLengthSlider().value).toBe('3')
    expect(cells()).toHaveLength(9)
  })
})
