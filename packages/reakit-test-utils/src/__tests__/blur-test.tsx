import * as React from "react";
import { render } from "../render";
import { blur } from "../blur";
import { type } from "../type";
import { useAllEvents } from "./useAllEvents";

test("blur", async () => {
  const stack = [] as any[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return (
      <button ref={ref} autoFocus>
        button
      </button>
    );
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");

  expect(button).toHaveFocus();
  blur(button);
  expect(document.body).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "blur button",
      "focusout button",
    ]
  `);
});

test("blur not focused", async () => {
  const stack = [] as any[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return <button ref={ref}>button</button>;
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");

  expect(document.body).toHaveFocus();
  blur(button); // does nothing
  expect(document.body).toHaveFocus();

  expect(console).toHaveWarned();
  expect(stack).toEqual([]);
});

test("blur disabled", async () => {
  const stack = [] as any[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return (
      <button ref={ref} autoFocus disabled>
        button
      </button>
    );
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");

  expect(document.body).toHaveFocus();
  blur(button); // does nothing
  expect(document.body).toHaveFocus();

  expect(console).toHaveWarned();
  expect(stack).toEqual([]);
});

test("blur input after change", () => {
  const stack = [] as any[];
  const Test = () => {
    const ref = React.useRef<HTMLInputElement>(null);
    useAllEvents(ref, stack);
    return <input ref={ref} aria-label="input" />;
  };
  const { getByLabelText } = render(<Test />);
  const input = getByLabelText("input");

  type("aa", input);
  blur();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "focus input",
      "focusin input",
      "keydown input",
      "keypress input",
      "input input",
      "keyup input",
      "keydown input",
      "keypress input",
      "input input",
      "keyup input",
      "change input",
      "blur input",
      "focusout input",
    ]
  `);
});
