import { useRef } from "react";
import { blur } from "../blur.ts";
import { q, render } from "../react.tsx";
import { useAllEvents } from "./use-all-events.ts";

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
