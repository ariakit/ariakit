import * as React from "react";
import { render, focus } from "reakit-test-utils";
import { Tabbable } from "../Tabbable";

test("render", () => {
  const { getByText } = render(<Tabbable>tabbable</Tabbable>);
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <div
      tabindex="0"
    >
      tabbable
    </div>
  `);
});

test("render disabled", () => {
  const { getByText } = render(<Tabbable disabled>tabbable</Tabbable>);
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <div
      aria-disabled="true"
      style="pointer-events: none;"
    >
      tabbable
    </div>
  `);
});

test("render disabled focusable", () => {
  const { getByText } = render(
    <Tabbable disabled focusable>
      tabbable
    </Tabbable>
  );
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <div
      aria-disabled="true"
      style="pointer-events: none;"
      tabindex="0"
    >
      tabbable
    </div>
  `);
});

test("render button", () => {
  const { getByText } = render(<Tabbable as="button">tabbable</Tabbable>);
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <button>
      tabbable
    </button>
  `);
});

test("render button disabled", () => {
  const { getByText } = render(
    <Tabbable as="button" disabled>
      tabbable
    </Tabbable>
  );
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <button
      aria-disabled="true"
      disabled=""
      style="pointer-events: none;"
    >
      tabbable
    </button>
  `);
});

test("render button disabled focusable", () => {
  const { getByText } = render(
    <Tabbable as="button" disabled focusable>
      tabbable
    </Tabbable>
  );
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <button
      aria-disabled="true"
      style="pointer-events: none;"
    >
      tabbable
    </button>
  `);
});

test("render link", () => {
  const { getByText } = render(
    <Tabbable as="a" href="https://reakit.io/docs/tabbable/">
      tabbable
    </Tabbable>
  );
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <a
      href="https://reakit.io/docs/tabbable/"
    >
      tabbable
    </a>
  `);
});

test("render link disabled", () => {
  const { getByText } = render(
    <Tabbable as="a" href="https://reakit.io/docs/tabbable/" disabled>
      tabbable
    </Tabbable>
  );
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <a
      aria-disabled="true"
      href="https://reakit.io/docs/tabbable/"
      style="pointer-events: none;"
      tabindex="-1"
    >
      tabbable
    </a>
  `);
});

test("render link disabled focusable", () => {
  const { getByText } = render(
    <Tabbable as="a" href="https://reakit.io/docs/tabbable/" disabled focusable>
      tabbable
    </Tabbable>
  );
  expect(getByText("tabbable")).toMatchInlineSnapshot(`
    <a
      aria-disabled="true"
      href="https://reakit.io/docs/tabbable/"
      style="pointer-events: none;"
    >
      tabbable
    </a>
  `);
});

test("focus", () => {
  const { getByText } = render(<Tabbable>tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("focus disabled", () => {
  const { getByText } = render(<Tabbable disabled>tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
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
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("focus native button", () => {
  const { getByText } = render(<Tabbable as="button">tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("focus native button disabled", () => {
  const { getByText } = render(
    <Tabbable as="button" disabled>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).not.toHaveFocus();
});

test("focus native button disabled focusable", () => {
  const { getByText } = render(
    <Tabbable as="button" disabled focusable>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("focus native link", () => {
  const { getByText } = render(
    <Tabbable as="a" href="https://reakit.io/docs/tabbable/">
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("focus native link disabled", () => {
  const { getByText } = render(
    <Tabbable as="a" href="https://reakit.io/docs/tabbable/" disabled>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).not.toHaveFocus();
});

test("focus native link disabled focusable", () => {
  const { getByText } = render(
    <Tabbable as="a" href="https://reakit.io/docs/tabbable/" disabled focusable>
      tabbable
    </Tabbable>
  );
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("focus nested native tabbables", () => {
  const { getByText } = render(
    <Tabbable>
      tabbable<button>button</button>
    </Tabbable>
  );
  const button = getByText("button");
  expect(button).not.toHaveFocus();
  focus(button);
  expect(button).toHaveFocus();
});
