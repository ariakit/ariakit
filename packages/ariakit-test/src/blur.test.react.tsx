import { useRef } from "react";
import { expect, test } from "vitest";
import { useAllEvents } from "./__use-all-events.test.helper.ts";
import { blur } from "./blur.ts";
import { q, render } from "./react.tsx";

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

  await render(<Test />);

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
