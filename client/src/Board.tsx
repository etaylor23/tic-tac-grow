import React from "react";
import { CellValue } from "./types";
import { Cell } from "./Cell";

type Props = {
  board: CellValue[];
  size: number;
  winningCells: number[];
  gameOver: boolean;
  onCellClick: (index: number) => void;
};

export const Board = ({
  board,
  size,
  winningCells,
  gameOver,
  onCellClick,
}: Props) => (
  <div
    className="grid gap-1.5 w-full"
    style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
  >
    {board.map((value, index) => (
      <Cell
        key={index}
        index={index}
        value={value}
        isWinning={winningCells.includes(index)}
        disabled={gameOver || value !== undefined}
        onClick={onCellClick}
      />
    ))}
  </div>
);
