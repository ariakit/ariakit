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
  tabindex="0"
>
  tabbable
</div>
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

test("native button focus", () => {
  const { getByText } = render(<Tabbable as="button">tabbable</Tabbable>);
  const tabbable = getByText("tabbable");
  expect(tabbable).not.toHaveFocus();
  focus(tabbable);
  expect(tabbable).toHaveFocus();
});

test("native button focus disabled", () => {
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

test("native button focus disabled focusable", () => {
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
