import * as React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { Rover, useRoverState } from "..";

const keyDown = (key: string) =>
  fireEvent.keyDown(document.activeElement!, { key });

test("first rover is active", () => {
  const Test = () => {
    const rover = useRoverState();
    return (
      <>
        <Rover {...rover}>rover1</Rover>
        <Rover {...rover}>rover2</Rover>
        <Rover {...rover}>rover3</Rover>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const rover1 = getByText("rover1");
  expect(rover1).toHaveAttribute("tabindex", "0");
});

test("move focus with keys", () => {
  const Test = () => {
    const rover = useRoverState();
    return (
      <>
        <Rover {...rover}>rover1</Rover>
        <Rover {...rover}>rover2</Rover>
        <Rover {...rover}>rover3</Rover>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const rover1 = getByText("rover1");
  const rover2 = getByText("rover2");
  const rover3 = getByText("rover3");
  act(() => rover1.focus());
  expect(rover1).toHaveFocus();

  keyDown("ArrowRight");
  expect(rover2).toHaveFocus();
  keyDown("ArrowDown");
  expect(rover3).toHaveFocus();
  keyDown("ArrowRight");
  expect(rover3).toHaveFocus();

  keyDown("ArrowLeft");
  expect(rover2).toHaveFocus();
  keyDown("ArrowUp");
  expect(rover1).toHaveFocus();
  keyDown("ArrowLeft");
  expect(rover1).toHaveFocus();

  keyDown("End");
  expect(rover3).toHaveFocus();
  keyDown("Home");
  expect(rover1).toHaveFocus();
  keyDown("PageDown");
  expect(rover3).toHaveFocus();
  keyDown("PageUp");
  expect(rover1).toHaveFocus();
});

test("move focus with keys disabled", () => {
  const Test = () => {
    const rover = useRoverState();
    return (
      <>
        <Rover {...rover}>rover1</Rover>
        <Rover {...rover} disabled focusable>
          rover2
        </Rover>
        <Rover {...rover} disabled>
          rover3
        </Rover>
        <Rover {...rover}>rover4</Rover>
        <Rover {...rover} disabled>
          rover5
        </Rover>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const rover1 = getByText("rover1");
  const rover2 = getByText("rover2");
  const rover4 = getByText("rover4");
  act(() => rover1.focus());
  expect(rover1).toHaveFocus();

  keyDown("ArrowRight");
  expect(rover2).toHaveFocus();
  keyDown("ArrowDown");
  expect(rover4).toHaveFocus();
  keyDown("ArrowRight");
  expect(rover4).toHaveFocus();

  keyDown("ArrowLeft");
  expect(rover2).toHaveFocus();
  keyDown("ArrowUp");
  expect(rover1).toHaveFocus();
  keyDown("ArrowLeft");
  expect(rover1).toHaveFocus();

  keyDown("End");
  expect(rover4).toHaveFocus();
  keyDown("Home");
  expect(rover1).toHaveFocus();
  keyDown("PageDown");
  expect(rover4).toHaveFocus();
  keyDown("PageUp");
  expect(rover1).toHaveFocus();
});

test("move focus with keys and horizontal orientation", () => {
  const Test = () => {
    const rover = useRoverState({ orientation: "horizontal" });
    return (
      <>
        <Rover {...rover}>rover1</Rover>
        <Rover {...rover}>rover2</Rover>
        <Rover {...rover}>rover3</Rover>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const rover1 = getByText("rover1");
  const rover2 = getByText("rover2");
  const rover3 = getByText("rover3");
  act(() => rover1.focus());
  expect(rover1).toHaveFocus();

  keyDown("ArrowRight");
  expect(rover2).toHaveFocus();
  keyDown("ArrowDown");
  expect(rover2).toHaveFocus();
  keyDown("ArrowRight");
  expect(rover3).toHaveFocus();

  keyDown("ArrowLeft");
  expect(rover2).toHaveFocus();
  keyDown("ArrowUp");
  expect(rover2).toHaveFocus();
  keyDown("ArrowLeft");
  expect(rover1).toHaveFocus();
});

test("move focus with keys and vertical orientation", () => {
  const Test = () => {
    const rover = useRoverState({ orientation: "vertical" });
    return (
      <>
        <Rover {...rover}>rover1</Rover>
        <Rover {...rover}>rover2</Rover>
        <Rover {...rover}>rover3</Rover>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const rover1 = getByText("rover1");
  const rover2 = getByText("rover2");
  const rover3 = getByText("rover3");
  act(() => rover1.focus());
  expect(rover1).toHaveFocus();

  keyDown("ArrowDown");
  expect(rover2).toHaveFocus();
  keyDown("ArrowRight");
  expect(rover2).toHaveFocus();
  keyDown("ArrowDown");
  expect(rover3).toHaveFocus();

  keyDown("ArrowUp");
  expect(rover2).toHaveFocus();
  keyDown("ArrowLeft");
  expect(rover2).toHaveFocus();
  keyDown("ArrowUp");
  expect(rover1).toHaveFocus();
});
