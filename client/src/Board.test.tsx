/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Board } from "./Board";
import { emptyBoard } from "./game";

describe("Board", () => {
  it("renders size*size cells", () => {
    render(
      <Board
        board={emptyBoard(4)}
        size={4}
        winningCells={[]}
        gameOver={false}
        onCellClick={() => {}}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(16);
  });

  it("calls onCellClick with the clicked cell index", () => {
    const onCellClick = jest.fn();
    render(
      <Board
        board={emptyBoard(3)}
        size={3}
        winningCells={[]}
        gameOver={false}
        onCellClick={onCellClick}
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[5]);
    expect(onCellClick).toHaveBeenCalledWith(5);
  });

  it("sets the grid column count from size", () => {
    const { container } = render(
      <Board
        board={emptyBoard(3)}
        size={3}
        winningCells={[]}
        gameOver={false}
        onCellClick={() => {}}
      />,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toContain("repeat(3");
  });
});
