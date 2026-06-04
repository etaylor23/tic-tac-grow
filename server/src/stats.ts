export type StatGame = {
  winnerId: number | null;
  isDraw: boolean;
  playerIds: number[];
};
export type StatPlayer = { id: number; name: string };
export type Stat = {
  name: string;
  wins: number;
  losses: number;
  draws: number;
  played: number;
};

// Pure: derive per-player tallies from game records. Losses fall out of played - wins - draws,
// so wins/losses/draws are never duplicated onto the join rows.
export const computeStats = (
  players: StatPlayer[],
  games: StatGame[],
): Stat[] =>
  players
    .map(({ id, name }) => {
      const played = games.filter((g) => g.playerIds.includes(id));
      const wins = played.filter((g) => g.winnerId === id).length;
      const draws = played.filter((g) => g.isDraw).length;
      return {
        name,
        wins,
        losses: played.length - wins - draws,
        draws,
        played: played.length,
      };
    })
    .sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name));
