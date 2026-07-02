import * as Ariakit from "@ariakit/react";
import type { ChangeEvent } from "react";
import { useState } from "react";

export default function Example() {
  const [fruit, setFruit] = useState("none");

  // Commit the value unconditionally instead of gating on
  // event.target.checked: arrow-key selection forwards a focus event where
  // checked is still false, and Ariakit only calls onChange for the radio
  // that is becoming checked anyway.
  // TODO: Remove once https://github.com/ariakit/ariakit/issues/6345 is
  // fixed and go back to the checked-gated handler.
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setFruit(event.target.value);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Ariakit.RadioProvider>
        <Ariakit.RadioGroup aria-label="Fruits">
          <label>
            <Ariakit.Radio value="apple" onChange={onChange} /> apple
          </label>
          <label>
            <Ariakit.Radio value="orange" onChange={onChange} /> orange
          </label>
          <label>
            <Ariakit.Radio value="watermelon" onChange={onChange} /> watermelon
          </label>
        </Ariakit.RadioGroup>
      </Ariakit.RadioProvider>
      <output>Selected fruit: {fruit}</output>
    </div>
  );
}
