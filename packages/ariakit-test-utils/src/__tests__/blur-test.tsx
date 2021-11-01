import { useRef } from "react";
import { blur } from "../blur";
import { render } from "../render";
import { useAllEvents } from "./use-all-events";

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
  blur(button);
  expect(document.body).toHaveFocus();

  expect(stack).toMatchInlineSnapshot(`
    Array [
      "blur button",
      "focusout button",
    ]
  `);
});
