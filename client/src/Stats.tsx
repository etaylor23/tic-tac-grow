import React from "react";
import { Stat } from "./api";

type Props = { stats: Stat[] };

export const Stats = ({ stats }: Props) => {
  if (stats.length === 0)
    return <p className="text-sm text-slate-400">No games played yet.</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-wide text-slate-400">
          <th className="py-1 text-left font-medium">Player</th>
          <th className="py-1 text-center font-medium">W</th>
          <th className="py-1 text-center font-medium">L</th>
          <th className="py-1 text-center font-medium">D</th>
          <th className="py-1 text-center font-medium">Played</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((s) => (
          <tr key={s.name} className="border-t border-slate-100">
            <td className="py-1.5 font-semibold text-slate-700">{s.name}</td>
            <td className="py-1.5 text-center font-semibold text-emerald-600">
              {s.wins}
            </td>
            <td className="py-1.5 text-center text-rose-500">{s.losses}</td>
            <td className="py-1.5 text-center text-slate-500">{s.draws}</td>
            <td className="py-1.5 text-center text-slate-500">{s.played}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
