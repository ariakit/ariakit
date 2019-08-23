import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Tabbable } from "../Tabbable";

test("render", () => {
  const { getByText } = render(<Tabbable>tabbable</Tabbable>);
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <button
      tabindex="0"
    >
      tabbable
    </button>
  `);
});

test("render disabled", () => {
  const { getByText } = render(<Tabbable disabled>tabbable</Tabbable>);
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <button
      aria-disabled="true"
      disabled=""
    >
      tabbable
    </button>
  `);
});

test("render disabled focusable", () => {
  const { getByText } = render(
    <Tabbable disabled focusable>
      tabbable
    </Tabbable>
  );
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <button
      aria-disabled="true"
      tabindex="0"
    >
      tabbable
    </button>
  `);
});

test("click", () => {
  const fn = jest.fn();
  const { getByText } = render(<Tabbable onClick={fn}>tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(fn).toHaveBeenCalledTimes(0);
  fireEvent.click(tabbable);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("click disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable onClick={fn} disabled>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  fireEvent.click(tabbable);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("click disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable onClick={fn} disabled focusable>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  fireEvent.click(tabbable);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("focus", () => {
  const { getByText } = render(<Tabbable>tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  tabbable.focus();
  expect(tabbable).toHaveFocus();
});

test("focus disabled", () => {
  const { getByText } = render(<Tabbable disabled>tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  tabbable.focus();
  expect(tabbable).not.toHaveFocus();
});

test("focus disabled focusable", () => {
  const { getByText } = render(
    <Tabbable disabled focusable>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  tabbable.focus();
  expect(tabbable).toHaveFocus();
});

test("clickKeys", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable unstable_clickKeys={["a"]} onClick={fn}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  fireEvent.keyDown(tabbable, { key: "Enter" });
  fireEvent.keyDown(tabbable, { key: " " });
  expect(fn).not.toHaveBeenCalled();
  fireEvent.keyDown(tabbable, { key: "a" });
  expect(fn).toHaveBeenCalledTimes(1);
});

test("non-native button click", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(fn).toHaveBeenCalledTimes(0);
  fireEvent.click(tabbable);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("non-native button click disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn} disabled>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  fireEvent.click(tabbable);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button click disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn} disabled focusable>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  fireEvent.click(tabbable);
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button focus", () => {
  const { getByText } = render(<Tabbable as="div">tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  tabbable.focus();
  expect(tabbable).toHaveFocus();
});

test("non-native button focus disabled", () => {
  const { getByText } = render(
    <Tabbable as="div" disabled>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  tabbable.focus();
  expect(tabbable).not.toHaveFocus();
});

test("non-native button focus disabled focusable", () => {
  const { getByText } = render(
    <Tabbable as="div" disabled focusable>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  tabbable.focus();
  expect(tabbable).toHaveFocus();
});

test("non-native button space/enter", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" onClick={fn}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  fireEvent.keyDown(tabbable, { key: "Enter" });
  expect(fn).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(tabbable, { key: " " });
  expect(fn).toHaveBeenCalledTimes(2);
});

test("non-native button space/enter disabled", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" disabled onClick={fn}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  fireEvent.keyDown(tabbable, { key: "Enter" });
  fireEvent.keyDown(tabbable, { key: " " });
  expect(fn).toHaveBeenCalledTimes(0);
});

test("non-native button space/enter disabled focusable", () => {
  const fn = jest.fn();
  const { getByText } = render(
    <Tabbable as="div" disabled focusable onClick={fn}>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  fireEvent.keyDown(tabbable, { key: "Enter" });
  fireEvent.keyDown(tabbable, { key: " " });
  expect(fn).toHaveBeenCalledTimes(0);
});

test("focus on mouse down", () => {
  const { getByText } = render(<Tabbable>tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  fireEvent.mouseDown(tabbable);
  expect(tabbable).toHaveFocus();
});

test("focus nested native tabbables", () => {
  const { getByText } = render(
    <Tabbable as="div">
      tabbable<button>button</button>
    </Tabbable>
  );
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  button.focus();
  fireEvent.mouseDown(button);
  expect(button).toHaveFocus();
});
