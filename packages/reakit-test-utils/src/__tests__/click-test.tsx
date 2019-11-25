import * as React from "react";
import { render } from "../react-testing-library";
import { click } from "../click";
import { useAllEvents } from "./useAllEvents";

test("click", async () => {
  const stack = [] as string[];
  const Test = () => {
    const ref = React.useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return <button ref={ref}>button</button>;
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");
  click(button);
  expect(stack).toMatchInlineSnapshot(`
    Array [
      "mousedown button",
      "mouseup button",
      "click button",
    ]
  `);
});
