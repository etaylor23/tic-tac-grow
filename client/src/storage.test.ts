/**
 * @jest-environment jsdom
 */
import { loadOngoing, saveOngoing, removeOngoing } from "./storage";
import { OngoingGame } from "./api";

const game = (id: string, moves: number[] = []): OngoingGame => ({
  id,
  players: [
    { name: "Ada", symbol: "X" },
    { name: "Bob", symbol: "O" },
  ],
  boardSize: 3,
  winLength: 3,
  moves,
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("ongoing-game storage", () => {
  beforeEach(() => localStorage.clear());

  it("starts empty", () => {
    expect(loadOngoing()).toEqual([]);
  });

  it("saves and loads a game", () => {
    saveOngoing(game("a", [0]));
    expect(loadOngoing()).toEqual([game("a", [0])]);
  });

  it("upserts by id — latest state, no duplicates", () => {
    saveOngoing(game("a", [0]));
    saveOngoing(game("a", [0, 1]));
    const all = loadOngoing();
    expect(all).toHaveLength(1);
    expect(all[0].moves).toEqual([0, 1]);
  });

  it("removes by id", () => {
    saveOngoing(game("a"));
    saveOngoing(game("b"));
    removeOngoing("a");
    expect(loadOngoing().map((g) => g.id)).toEqual(["b"]);
  });

  it("survives malformed storage", () => {
    localStorage.setItem("tic-tac-grow:ongoing", "not json");
    expect(loadOngoing()).toEqual([]);
  });
});
