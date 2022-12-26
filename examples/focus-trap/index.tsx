import { FocusEvent, useRef } from "react";
import { Checkbox, FocusTrap, useCheckboxStore } from "@ariakit/react";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxStore({ defaultValue: true });
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
      {focusTrapped && <FocusTrap onFocus={onTrapFocus} />}
      <div className="wrapper">
        <label className="label">
          <Checkbox store={checkbox} ref={firstRef} className="checkbox" />
          Trap focus
        </label>

        <button className="button" ref={lastRef}>
          Button
        </button>
      </div>
      {focusTrapped && <FocusTrap onFocus={onTrapFocus} />}
    </>
  );
}
