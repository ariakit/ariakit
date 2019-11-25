import * as React from "react";
import { render } from "../react-testing-library";
import { blur } from "../blur";
import { useAllEvents } from "./useAllEvents";

test("blur", async () => {
  const stack = [] as any[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return <button ref={ref}>button</button>;
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");

  button.focus();
  expect(button).toHaveFocus();
  blur(button);
  expect(button).not.toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "focus button",
      "focusout button",
      "blur button",
    ]
  `);
});
