/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Cell } from "./Cell";

describe("Cell", () => {
  it("renders its value", () => {
    render(
      <Cell
        value="X"
        index={0}
        isWinning={false}
        disabled={false}
        onClick={() => {}}
      />,
    );
    expect(screen.getByRole("button").textContent).toBe("X");
  });

  it("calls onClick with its index when clicked", () => {
    const onClick = jest.fn();
    render(
      <Cell
        value={undefined}
        index={4}
        isWinning={false}
        disabled={false}
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith(4);
  });

  it("is disabled and does not fire onClick when disabled", () => {
    const onClick = jest.fn();
    render(
      <Cell
        value="O"
        index={0}
        isWinning={false}
        disabled={true}
        onClick={onClick}
      />,
    );
    const button = screen.getByRole("button") as HTMLButtonElement;
    fireEvent.click(button);
    expect(button.disabled).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("styles the winning cell differently", () => {
    const { rerender } = render(
      <Cell
        value="X"
        index={0}
        isWinning={false}
        disabled={true}
        onClick={() => {}}
      />,
    );
    const plain = screen.getByRole("button").className;
    rerender(
      <Cell
        value="X"
        index={0}
        isWinning={true}
        disabled={true}
        onClick={() => {}}
      />,
    );
    expect(screen.getByRole("button").className).not.toBe(plain);
  });
});
