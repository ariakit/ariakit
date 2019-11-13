import * as React from "react";
import { render } from "../react-testing-library";
import { focus } from "../focus";

test("focus", async () => {
  const called = [] as any[];
  const Test = () => {
    const ref1 = React.useRef<HTMLButtonElement>(null);
    const ref2 = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      const self1 = ref1.current;
      const self2 = ref2.current;
      if (!self1 || !self2) return undefined;
      const onFocusIn = (event: FocusEvent) => called.push(event.type);
      const onFocusOut = (event: FocusEvent) => called.push(event.type);
      self1.addEventListener("focusin", onFocusIn);
      self1.addEventListener("focusout", onFocusOut);
      self2.addEventListener("focusin", onFocusIn);
      self2.addEventListener("focusout", onFocusOut);
      return () => {
        self1.removeEventListener("focusin", onFocusIn);
        self1.removeEventListener("focusout", onFocusOut);
        self2.removeEventListener("focusin", onFocusIn);
        self2.removeEventListener("focusout", onFocusOut);
      };
    }, []);

    return (
      <>
        <button
          ref={ref1}
          onFocus={event => called.push(event.type)}
          onBlur={event => called.push(event.type)}
        >
          button
        </button>
        <button
          ref={ref2}
          onFocus={event => called.push(event.type)}
          onBlur={event => called.push(event.type)}
        >
          otherButton
        </button>
      </>
    );
  };
  const { getByText } = render(<Test />);
  const button = getByText("button");
  const otherButton = getByText("otherButton");
  focus(button);
  expect(called).toEqual(["focusin", "focus"]);
  focus(otherButton);
  expect(called).toEqual([
    "focusin",
    "focus",
    "focusout",
    "focusin",
    "blur",
    "focus"
  ]);
});
