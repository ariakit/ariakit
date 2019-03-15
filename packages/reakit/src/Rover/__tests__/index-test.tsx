import * as React from "react";
import { render, fireEvent, act } from "react-testing-library";
import { Rover, useRoverState } from "..";

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
  fireEvent.keyDown(rover1, { key: "ArrowRight" });
  expect(rover2).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowDown" });
  expect(rover3).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowRight" });
  expect(rover3).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowLeft" });
  expect(rover2).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowUp" });
  expect(rover1).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowLeft" });
  expect(rover1).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "End" });
  expect(rover3).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "Home" });
  expect(rover1).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "PageDown" });
  expect(rover3).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "PageUp" });
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
  fireEvent.keyDown(rover1, { key: "ArrowRight" });
  expect(rover2).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowDown" }); // ignore
  expect(rover2).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowRight" });
  expect(rover3).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowLeft" });
  expect(rover2).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowUp" }); // ignore
  expect(rover2).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowLeft" });
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
  fireEvent.keyDown(rover1, { key: "ArrowDown" });
  expect(rover2).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowRight" }); // ignore
  expect(rover2).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowDown" });
  expect(rover3).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowUp" });
  expect(rover2).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowLeft" }); // ignore
  expect(rover2).toHaveFocus();
  fireEvent.keyDown(rover1, { key: "ArrowUp" });
  expect(rover1).toHaveFocus();
});
