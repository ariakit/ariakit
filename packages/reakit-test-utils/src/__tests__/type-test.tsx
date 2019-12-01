import * as React from "react";
import { render } from "../render";
import { type } from "../type";
import { useAllEvents } from "./useAllEvents";

test("type", () => {
  const values = [] as string[];
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLInputElement>(null);
    useAllEvents(ref, stack);
    return (
      <input
        ref={ref}
        aria-label="input"
        onChange={event => values.push(event.target.value)}
      />
    );
  };
  const { getByLabelText } = render(<Test />);
  const input = getByLabelText("input");

  type("ab cd\b\bef", input);

  expect(values).toMatchInlineSnapshot(`
    Array [
      "a",
      "ab",
      "ab ",
      "ab c",
      "ab cd",
      "ab c",
      "ab ",
      "ab e",
      "ab ef",
    ]
  `);

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "focus input",
      "focusin input",
      "keydown input",
      "input input",
      "keyup input",
      "keydown input",
      "input input",
      "keyup input",
      "keydown input",
      "input input",
      "keyup input",
      "keydown input",
      "input input",
      "keyup input",
      "keydown input",
      "input input",
      "keyup input",
      "keydown input",
      "input input",
      "keyup input",
      "keydown input",
      "input input",
      "keyup input",
      "keydown input",
      "input input",
      "keyup input",
      "keydown input",
      "input input",
      "keyup input",
    ]
  `);
});

test("type readOnly", () => {
  const values = [] as string[];
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLInputElement>(null);
    useAllEvents(ref, stack);
    return (
      <input
        ref={ref}
        aria-label="input"
        onChange={event => values.push(event.target.value)}
        readOnly
      />
    );
  };
  const { getByLabelText } = render(<Test />);
  const input = getByLabelText("input");

  type("ab cd\b\bef", input);

  expect(values).toEqual([]);

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "focus input",
      "focusin input",
      "keydown input",
      "keyup input",
      "keydown input",
      "keyup input",
      "keydown input",
      "keyup input",
      "keydown input",
      "keyup input",
      "keydown input",
      "keyup input",
      "keydown input",
      "keyup input",
      "keydown input",
      "keyup input",
      "keydown input",
      "keyup input",
      "keydown input",
      "keyup input",
    ]
  `);
});

test("type preventDefault", () => {
  const values = [] as string[];
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLInputElement>(null);
    useAllEvents(ref, stack);
    return (
      <input
        ref={ref}
        aria-label="input"
        onChange={event => values.push(event.target.value)}
        onKeyDown={event => {
          if (event.key !== "e") {
            event.preventDefault();
          }
        }}
      />
    );
  };
  const { getByLabelText } = render(<Test />);
  const input = getByLabelText("input");

  type("ab\be", input);

  expect(values).toEqual(["e"]);

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "focus input",
      "focusin input",
      "keydown input",
      "keyup input",
      "keydown input",
      "keyup input",
      "keydown input",
      "keyup input",
      "keydown input",
      "input input",
      "keyup input",
    ]
  `);
});

test("type on non-focusable element", () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLDivElement>(null);
    useAllEvents(ref, stack);
    return <div ref={ref} aria-label="input" />;
  };
  const { getByLabelText } = render(<Test />);
  const input = getByLabelText("input");

  type("a", input);

  expect(stack).toEqual([]);
});

test("type on focusable non-typeable element", () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return <button ref={ref} aria-label="input" />;
  };
  const { getByLabelText } = render(<Test />);
  const input = getByLabelText("input");

  type("a", input);

  expect(console).toHaveWarned();
  expect(stack).toEqual([]);
});
