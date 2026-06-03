/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { Stats } from './Stats'

describe('Stats', () => {
  it('renders a row per player with wins, losses, draws and played', () => {
    render(<Stats stats={[
      { name: 'Ada', wins: 2, losses: 1, draws: 1, played: 4 },
      { name: 'Bob', wins: 0, losses: 2, draws: 1, played: 3 }
    ]} />)
    const ada = screen.getByText('Ada').closest('tr') as HTMLElement
    expect(within(ada).getAllByRole('cell').map(c => c.textContent)).toEqual(['Ada', '2', '1', '1', '4'])
    expect(screen.getByText('Bob')).toBeTruthy()
  })

  it('shows an empty state when there are no stats', () => {
    render(<Stats stats={[]} />)
    expect(screen.getByText(/no games/i)).toBeTruthy()
  })
})
