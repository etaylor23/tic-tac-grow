import { emptyBoard, winner, isDraw } from "./game";
import { XorO, CellValue } from "./types";

const build = (size: number, marks: Record<number, XorO>): CellValue[] => {
  const board = emptyBoard(size);
  for (const [i, player] of Object.entries(marks)) board[Number(i)] = player;
  return board;
};

describe("emptyBoard", () => {
  it("creates a flat size*size board of empty cells", () => {
    const board = emptyBoard(3);
    expect(board).toHaveLength(9);
    expect(board.every((cell) => cell === undefined)).toBe(true);
  });
});

describe("winner (3x3, k=3)", () => {
  it("detects a row", () => {
    expect(winner(build(3, { 0: "X", 1: "X", 2: "X" }), 3, 3)).toEqual({
      player: "X",
      cells: [0, 1, 2],
    });
  });

  it("detects a column", () => {
    expect(winner(build(3, { 0: "X", 3: "X", 6: "X" }), 3, 3)).toEqual({
      player: "X",
      cells: [0, 3, 6],
    });
  });

  it("detects the ↘ diagonal", () => {
    expect(winner(build(3, { 0: "O", 4: "O", 8: "O" }), 3, 3)).toEqual({
      player: "O",
      cells: [0, 4, 8],
    });
  });

  it("detects the ↙ diagonal", () => {
    expect(winner(build(3, { 2: "O", 4: "O", 6: "O" }), 3, 3)).toEqual({
      player: "O",
      cells: [2, 4, 6],
    });
  });

  it("returns null for a game in progress", () => {
    expect(winner(build(3, { 0: "X", 1: "O" }), 3, 3)).toBeNull();
  });

  it("does not wrap across a row edge", () => {
    // indices 2,3,4 are adjacent in the flat array but span rows 0 and 1
    expect(winner(build(3, { 2: "X", 3: "X", 4: "X" }), 3, 3)).toBeNull();
  });
});

describe("winner (general size/k)", () => {
  it("detects a mid-row horizontal run on a 5x5 with k=3", () => {
    expect(winner(build(5, { 6: "X", 7: "X", 8: "X" }), 5, 3)).toEqual({
      player: "X",
      cells: [6, 7, 8],
    });
  });

  it("detects a ↘ diagonal run on a 5x5 with k=4", () => {
    expect(
      winner(build(5, { 0: "O", 6: "O", 12: "O", 18: "O" }), 5, 4),
    ).toEqual({ player: "O", cells: [0, 6, 12, 18] });
  });

  it("wins on the first run of k when a line is longer than k", () => {
    expect(winner(build(4, { 0: "X", 1: "X", 2: "X", 3: "X" }), 4, 3)).toEqual({
      player: "X",
      cells: [0, 1, 2],
    });
  });

  it("detects a full column on a 4x4 with k=4", () => {
    expect(winner(build(4, { 0: "X", 4: "X", 8: "X", 12: "X" }), 4, 4)).toEqual(
      { player: "X", cells: [0, 4, 8, 12] },
    );
  });

  it("detects an anti-diagonal ↙ run on a 5x5 with k=3", () => {
    expect(winner(build(5, { 3: "O", 7: "O", 11: "O" }), 5, 3)).toEqual({
      player: "O",
      cells: [3, 7, 11],
    });
  });
});

describe("isDraw", () => {
  it("is true for a full board with no winner", () => {
    const board = build(3, {
      0: "X",
      1: "O",
      2: "X",
      3: "X",
      4: "O",
      5: "O",
      6: "O",
      7: "X",
      8: "X",
    });
    expect(isDraw(board, winner(board, 3, 3))).toBe(true);
  });

  it("is false when there is a winner", () => {
    const board = build(3, { 0: "X", 1: "X", 2: "X" });
    expect(isDraw(board, winner(board, 3, 3))).toBe(false);
  });

  it("is false for a board still in progress", () => {
    expect(isDraw(build(3, { 0: "X" }), null)).toBe(false);
  });
});
