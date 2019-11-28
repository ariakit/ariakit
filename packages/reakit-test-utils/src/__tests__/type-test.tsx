import * as React from "react";
import { render } from "../render";
import { type } from "../type";
import { useAllEvents } from "./useAllEvents";

// TEST READONLY
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

  type("ab c def", input);
  type.Backspace(3, input);
  type("ghi", input);

  expect(values).toMatchInlineSnapshot(`
    Array [
      "a",
      "ab",
      "ab ",
      "ab c",
      "ab c ",
      "ab c d",
      "ab c de",
      "ab c def",
      "ab c de",
      "ab c d",
      "ab c ",
      "ab c g",
      "ab c gh",
      "ab c ghi",
    ]
  `);

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "input ",
      "input ",
      "input ",
      "input ",
      "input ",
      "input ",
      "input ",
      "input ",
      "input ",
      "input ",
      "input ",
      "input ",
      "input ",
      "input ",
    ]
  `);
});
