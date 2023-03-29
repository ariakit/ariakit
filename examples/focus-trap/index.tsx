import type { FocusEvent } from "react";
import { useRef } from "react";
import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const checkbox = Ariakit.useCheckboxStore({ defaultValue: true });
  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLButtonElement>(null);

  const focusTrapped = checkbox.useState("value");

  const onTrapFocus = (event: FocusEvent) => {
    if (event.relatedTarget === firstRef.current) {
      lastRef.current?.focus();
    } else {
      firstRef.current?.focus();
    }
  };

  return (
    <>
      {focusTrapped && <Ariakit.FocusTrap onFocus={onTrapFocus} />}
      <div className="wrapper">
        <label className="label">
          <Ariakit.Checkbox
            store={checkbox}
            ref={firstRef}
            className="checkbox"
          />
          Trap focus
        </label>

        <button className="button" ref={lastRef}>
          Button
        </button>
      </div>
      {focusTrapped && <Ariakit.FocusTrap onFocus={onTrapFocus} />}
    </>
  );
}
