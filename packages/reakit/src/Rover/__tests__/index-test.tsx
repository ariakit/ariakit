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

test("move focus by calling state callbacks", () => {
  const Test = () => {
    const rover = useRoverState();
    return (
      <>
        <button onClick={rover.first}>first</button>
        <Rover {...rover}>rover1</Rover>
        <Rover {...rover}>rover2</Rover>
        <Rover {...rover}>rover3</Rover>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const first = getByText("first");
  const rover1 = getByText("rover1");
  act(() => first.focus());
  expect(first).toHaveFocus();

  fireEvent.click(first);
  expect(rover1).toHaveFocus();

  act(() => first.focus());
  expect(first).toHaveFocus();

  fireEvent.click(first);
  expect(rover1).toHaveFocus();
});

test("move focus in nested rover", () => {
  const Test = () => {
    const rover1 = useRoverState({ orientation: "horizontal" });
    const rover2 = useRoverState({ orientation: "vertical" });
    return (
      <>
        <Rover {...rover1}>rover11</Rover>
        <Rover {...rover1} as="div">
          rover12
          <Rover {...rover2}>rover21</Rover>
          <Rover {...rover2}>rover22</Rover>
          <Rover {...rover2}>rover23</Rover>
        </Rover>
        <Rover {...rover1}>rover13</Rover>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const rover11 = getByText("rover11");
  const rover12 = getByText("rover12");
  const rover13 = getByText("rover13");
  const rover21 = getByText("rover21");
  const rover22 = getByText("rover22");
  const rover23 = getByText("rover23");
  act(() => rover11.focus());
  expect(rover11).toHaveFocus();

  keyDown("ArrowRight");
  expect(rover12).toHaveFocus();
  keyDown("ArrowRight");
  expect(rover13).toHaveFocus();

  act(() => rover22.focus());
  expect(rover22).toHaveFocus();

  keyDown("ArrowDown");
  expect(rover23).toHaveFocus();
  keyDown("ArrowUp");
  expect(rover22).toHaveFocus();
  keyDown("ArrowUp");
  expect(rover21).toHaveFocus();
  keyDown("ArrowDown");
  expect(rover22).toHaveFocus();

  keyDown("ArrowLeft");
  expect(rover11).toHaveFocus();
});
