export type PlayerInput = { name: string; symbol: "X" | "O" };
export type GamePayload = {
  players: PlayerInput[];
  boardSize: number;
  winLength: number;
  winnerName: string | null;
  isDraw: boolean;
  moves: number[];
};

const isInt = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= min &&
  value <= max;

// Pure: validate and normalise an incoming game body, throwing on anything malformed.
export const parseGameBody = (body: any): GamePayload => {
  if (!body || typeof body !== "object") throw new Error("invalid body");
  const { players, boardSize, winLength, winnerName, isDraw, moves } = body;

  if (!Array.isArray(players) || players.length !== 2)
    throw new Error("expected two players");
  const parsed: PlayerInput[] = players.map((p: any) => {
    if (!p || typeof p.name !== "string" || !p.name.trim())
      throw new Error("player name required");
    if (p.symbol !== "X" && p.symbol !== "O")
      throw new Error("symbol must be X or O");
    return { name: p.name.trim(), symbol: p.symbol };
  });
  if (parsed[0].symbol === parsed[1].symbol)
    throw new Error("players need distinct symbols");

  if (typeof isDraw !== "boolean") throw new Error("isDraw must be a boolean");
  if (!isInt(boardSize, 3, 15)) throw new Error("boardSize must be 3-15");
  if (!isInt(winLength, 3, boardSize))
    throw new Error("winLength must be 3-boardSize");

  const names = parsed.map((p) => p.name);
  if (isDraw) {
    if (winnerName !== null) throw new Error("a draw has no winner");
  } else if (typeof winnerName !== "string" || !names.includes(winnerName)) {
    throw new Error("winnerName must be one of the players");
  }

  if (
    !Array.isArray(moves) ||
    moves.some((m) => !isInt(m, 0, boardSize * boardSize - 1))
  ) {
    throw new Error("moves must be positions on the board");
  }
  if (new Set(moves).size !== moves.length)
    throw new Error("moves must be distinct");

  return {
    players: parsed,
    boardSize,
    winLength,
    winnerName: isDraw ? null : winnerName,
    isDraw,
    moves,
  };
};
