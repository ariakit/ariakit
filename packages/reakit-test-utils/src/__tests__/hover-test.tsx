import * as React from "react";
import { render } from "../render";
import { hover } from "../hover";
import { useAllEvents } from "./useAllEvents";

test("hover", async () => {
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

  hover(button1);
  hover(button2);

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "pointerover button1",
      "pointerenter button1",
      "mouseover button1",
      "mouseenter button1",
      "pointermove button1",
      "mousemove button1",
      "pointermove button1",
      "mousemove button1",
      "pointerout button1",
      "pointerleave button1",
      "mouseout button1",
      "mouseleave button1",
      "pointerover button2",
      "pointerenter button2",
      "mouseover button2",
      "mouseenter button2",
      "pointermove button2",
      "mousemove button2",
    ]
  `);
});
