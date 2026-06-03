import React from 'react'
import { Stats } from './Stats'
import { Stat } from './api'
import { card } from './ui'

type Props = { stats: Stat[] }

export const Leaderboard = ({ stats }: Props) =>
  <section className={`${card} flex flex-col gap-3`}>
    <h2 className='text-lg font-bold'>Leaderboard</h2>
    <Stats stats={stats} />
  </section>
