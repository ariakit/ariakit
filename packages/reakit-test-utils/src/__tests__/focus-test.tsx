import * as React from "react";
import { render } from "../react-testing-library";
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
      "focusin button1",
      "focus button1",
      "focusout button1",
      "focusin button2",
      "blur button1",
      "focus button2",
    ]
  `);
});
