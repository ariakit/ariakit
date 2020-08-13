import * as React from "react";
import { render } from "../render";
import { focus } from "../focus";
import { useAllEvents } from "./useAllEvents";

test("focus", async () => {
  const stack = [] as any[];
  const Test = () => {
    const ref1 = React.useRef<HTMLButtonElement>(null);
    const ref2 = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref1, stack);
    useAllEvents(ref2, stack);
    return (
      <>
        <button ref={ref1}>button1</button>
        <button ref={ref2}>button2</button>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const button1 = getByText("button1");
  const button2 = getByText("button2");

  focus(button1);
  expect(button1).toHaveFocus();
  focus(button2);
  expect(button2).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "focus button1",
      "focusin button1",
      "blur button1",
      "focusout button1",
      "focus button2",
      "focusin button2",
    ]
  `);
});

test("focus disabled", async () => {
  const stack = [] as any[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return (
      <button ref={ref} disabled>
        button
      </button>
    );
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");

  focus(button);
  expect(button).not.toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`Array []`);
});

test("focus readOnly", async () => {
  const stack = [] as any[];
  const Test = () => {
    const ref = React.useRef<HTMLInputElement>(null);
    useAllEvents(ref, stack);
    return <input ref={ref} readOnly aria-label="input" />;
  };
  const { getByLabelText } = render(<Test />);
  const input = getByLabelText("input");

  focus(input);
  expect(input).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "focus input",
      "focusin input",
    ]
  `);
});
