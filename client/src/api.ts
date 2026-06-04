export type Stat = {
  name: string;
  wins: number;
  losses: number;
  draws: number;
  played: number;
};

type PlayerInput = { name: string; symbol: "X" | "O" };

export type GamePayload = {
  players: PlayerInput[];
  boardSize: number;
  winLength: number;
  winnerName: string | null;
  isDraw: boolean;
  moves: number[];
};

// an in-progress game held in localStorage — the same shape we sync to the DB on finish
export type OngoingGame = {
  id: string;
  players: PlayerInput[];
  boardSize: number;
  winLength: number;
  moves: number[];
  updatedAt: string;
};

export const postGame = async (payload: GamePayload): Promise<void> => {
  await fetch("/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const fetchStats = async (): Promise<Stat[]> => {
  const res = await fetch("/api/stats");
  return res.json();
};
