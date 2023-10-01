import { useRef } from "react";
import { blur } from "../blur.js";
import { render } from "../render.js";
import { useAllEvents } from "./use-all-events.js";

test("blur", async () => {
  const stack = [] as any[];
  const Test = () => {
    const ref = useRef<HTMLButtonElement>(null);
    useAllEvents(ref, stack);
    return (
      <button ref={ref} autoFocus>
        button
      </button>
    );
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");

  expect(button).toHaveFocus();
  await blur(button);
  expect(document.body).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    [
      "blur button",
      "focusout button",
    ]
  `);
});
