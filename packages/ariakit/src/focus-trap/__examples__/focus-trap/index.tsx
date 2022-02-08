import { FocusEvent, useRef } from "react";
import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import { FocusTrap } from "ariakit/focus-trap";
import "./style.css";

export default function Example() {
  const focusTrapped = useCheckboxState({ defaultValue: true });
  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLButtonElement>(null);

  const onTrapFocus = (event: FocusEvent) => {
    if (event.relatedTarget === firstRef.current) {
      lastRef.current?.focus();
    } else {
      firstRef.current?.focus();
    }
  };

  return (
    <>
      {focusTrapped.value && <FocusTrap onFocus={onTrapFocus} />}
      <div className="wrapper">
        <label className="label">
          <Checkbox state={focusTrapped} ref={firstRef} className="checkbox" />
          Trap focus
        </label>

        <button className="button" ref={lastRef}>
          Button
        </button>
      </div>
      {focusTrapped.value && <FocusTrap onFocus={onTrapFocus} />}
    </>
  );
}
