import { useRef } from "react";
import { blur } from "../blur.js";
import { q, render } from "../react.js";
import { useAllEvents } from "./use-all-events.js";

test("blur", async () => {
  const stack: string[] = [];

  const Test = () => {
    const ref = useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return (
      <button ref={ref} autoFocus>
        button
      </button>
    );
  };

  render(<Test />);

  expect(q.button()).toHaveFocus();
  await blur(q.button());
  expect(document.body).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    [
      "blur button",
      "focusout button",
    ]
  `);
});
