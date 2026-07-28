import * as Ariakit from "@ariakit/react";
import type { FocusEvent } from "react";
import { useRef, useState } from "react";

function FocusTrapRegion() {
  const [enabled, setEnabled] = useState(false);

  return (
    <section>
      <div tabIndex={0}>Before region</div>
      <Ariakit.FocusTrapRegion enabled={enabled}>
        <label>
          <input
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            type="checkbox"
          />
          Trap region
        </label>
        <button>Region first</button>
        <button>Region second</button>
        <button disabled>Region disabled</button>
        <label>
          Region input
          <input />
        </label>
        <label>
          Region disabled input
          <input disabled />
        </label>
      </Ariakit.FocusTrapRegion>
      <div tabIndex={0}>After region</div>
    </section>
  );
}

function StandaloneFocusTrap() {
  const [enabled, setEnabled] = useState(true);
  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLButtonElement>(null);

  const onTrapFocus = (event: FocusEvent) => {
    if (event.relatedTarget === firstRef.current) {
      lastRef.current?.focus();
      return;
    }
    firstRef.current?.focus();
  };

  return (
    <section>
      <div tabIndex={0}>Before standalone</div>
      {enabled && <Ariakit.FocusTrap onFocus={onTrapFocus} />}
      <label>
        <input
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          ref={firstRef}
          type="checkbox"
        />
        Trap standalone
      </label>
      <button ref={lastRef}>Standalone button</button>
      {enabled && <Ariakit.FocusTrap onFocus={onTrapFocus} />}
      <div tabIndex={0}>After standalone</div>
    </section>
  );
}

export default function Example() {
  return (
    <>
      <FocusTrapRegion />
      <StandaloneFocusTrap />
    </>
  );
}
