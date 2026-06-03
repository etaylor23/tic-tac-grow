/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { Main } from './main'

const statsFixture = [{ name: 'Zoe', wins: 3, losses: 1, draws: 0, played: 4 }]
let fetchMock: jest.Mock

beforeEach(() => {
  fetchMock = jest.fn((url: string) =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(String(url).includes('/api/stats') ? statsFixture : { id: 1 })
    })
  )
  global.fetch = fetchMock as unknown as typeof fetch
})

const renderApp = async () => {
  render(<Main />)
  await screen.findByText('Zoe') // flush the mount stats fetch
}

const textbox = (name: string) => screen.getByRole('textbox', { name }) as HTMLInputElement
const slider = (name: string) => screen.getByRole('slider', { name }) as HTMLInputElement
const setSlider = (el: HTMLInputElement, value: number) => fireEvent.change(el, { target: { value: String(value) } })
const status = () => screen.getByRole('status').textContent
const ignore = ['New game', 'Change setup', 'Start']
const cells = () => screen.getAllByRole('button').filter(b => !ignore.includes(b.textContent || ''))
const postCalls = () => fetchMock.mock.calls.filter(c => c[0] === '/api/games')

const startGame = (opts: { size?: number, k?: number } = {}) => {
  fireEvent.change(textbox('Player X name'), { target: { value: 'Ada' } })
  fireEvent.change(textbox('Player O name'), { target: { value: 'Bob' } })
  if (opts.size) setSlider(slider('Board size'), opts.size)
  if (opts.k) setSlider(slider('Win length'), opts.k)
  fireEvent.click(screen.getByRole('button', { name: 'Start' }))
}

describe('Main — setup gate', () => {
  it('enables Start only with two distinct, non-empty names', async () => {
    await renderApp()
    const start = () => screen.getByRole('button', { name: 'Start' }) as HTMLButtonElement
    expect(start().disabled).toBe(true)
    fireEvent.change(textbox('Player X name'), { target: { value: 'Ada' } })
    expect(start().disabled).toBe(true)
    fireEvent.change(textbox('Player O name'), { target: { value: 'Ada' } })
    expect(start().disabled).toBe(true)
    fireEvent.change(textbox('Player O name'), { target: { value: 'Bob' } })
    expect(start().disabled).toBe(false)
  })

  it('bounds the setup sliders and clamps win length to the board size', async () => {
    await renderApp()
    expect(slider('Board size').min).toBe('3')
    expect(slider('Board size').max).toBe('15')
    setSlider(slider('Board size'), 5)
    expect(slider('Win length').max).toBe('5')
    setSlider(slider('Win length'), 5)
    expect(slider('Win length').value).toBe('5')
    setSlider(slider('Board size'), 3)
    expect(slider('Win length').value).toBe('3')
  })
})

describe('Main — playing', () => {
  it('alternates players and ignores occupied cells', async () => {
    await renderApp()
    startGame()
    expect(status()).toBe('X to move')
    fireEvent.click(cells()[0])
    expect(cells()[0].textContent).toBe('X')
    expect(status()).toBe('O to move')
    fireEvent.click(cells()[0])
    expect(cells()[0].textContent).toBe('X')
    expect(status()).toBe('O to move')
  })

  it('announces a win and locks the board', async () => {
    await renderApp()
    startGame()
    ;[0, 3, 1, 4, 2].forEach(i => fireEvent.click(cells()[i]))
    expect(status()).toBe('X wins!')
    fireEvent.click(cells()[5])
    expect(cells()[5].textContent).toBe('')
    await waitFor(() => expect(postCalls()).toHaveLength(1))
  })

  it('announces a draw', async () => {
    await renderApp()
    startGame()
    ;[0, 1, 2, 4, 3, 5, 7, 6, 8].forEach(i => fireEvent.click(cells()[i]))
    expect(status()).toBe("It's a draw")
    await waitFor(() => expect(postCalls()).toHaveLength(1))
  })

  it('plays on a larger board with a smaller win length', async () => {
    await renderApp()
    startGame({ size: 5 })
    expect(cells()).toHaveLength(25)
    ;[0, 5, 1, 6, 2].forEach(i => fireEvent.click(cells()[i]))
    expect(status()).toBe('X wins!')
    await waitFor(() => expect(postCalls()).toHaveLength(1))
  })

  it('New game rematches and Change setup returns to setup', async () => {
    await renderApp()
    startGame()
    fireEvent.click(cells()[0])
    fireEvent.click(screen.getByRole('button', { name: 'New game' }))
    expect(cells().every(c => c.textContent === '')).toBe(true)
    expect(status()).toBe('X to move')
    fireEvent.click(screen.getByRole('button', { name: 'Change setup' }))
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
  })
})

describe('Main — persistence & stats', () => {
  it('renders stats fetched on mount', async () => {
    await renderApp()
    const row = screen.getByText('Zoe').closest('tr') as HTMLElement
    expect(within(row).getAllByRole('cell').map(c => c.textContent)).toEqual(['Zoe', '3', '1', '0', '4'])
  })

  it('records the finished game exactly once with the right payload', async () => {
    await renderApp()
    startGame()
    ;[0, 3, 1, 4, 2].forEach(i => fireEvent.click(cells()[i])) // Ada (X) wins
    await waitFor(() => expect(postCalls()).toHaveLength(1))
    expect(JSON.parse(postCalls()[0][1].body)).toMatchObject({
      players: [{ name: 'Ada', symbol: 'X' }, { name: 'Bob', symbol: 'O' }],
      boardSize: 3, winLength: 3, winnerName: 'Ada', isDraw: false
    })
    fireEvent.click(cells()[5]) // locked — no extra post
    expect(postCalls()).toHaveLength(1)
  })
})
