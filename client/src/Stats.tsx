import React from 'react'
import { Stat } from './api'

type Props = { stats: Stat[] }

export const Stats = ({ stats }: Props) => {
  if (stats.length === 0) return <div className='text-sm text-gray-500'>No games played yet.</div>
  return <table className='text-sm border-collapse'>
    <thead>
      <tr className='border-b-2 border-gray-900'>
        <th className='px-3 py-1 text-left'>Player</th>
        <th className='px-3 py-1'>W</th>
        <th className='px-3 py-1'>L</th>
        <th className='px-3 py-1'>D</th>
        <th className='px-3 py-1'>Played</th>
      </tr>
    </thead>
    <tbody>
      {stats.map(s =>
        <tr key={s.name} className='border-b border-gray-300'>
          <td className='px-3 py-1 text-left font-bold'>{s.name}</td>
          <td className='px-3 py-1 text-center'>{s.wins}</td>
          <td className='px-3 py-1 text-center'>{s.losses}</td>
          <td className='px-3 py-1 text-center'>{s.draws}</td>
          <td className='px-3 py-1 text-center'>{s.played}</td>
        </tr>
      )}
    </tbody>
  </table>
}
