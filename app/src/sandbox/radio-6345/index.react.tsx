import * as Ariakit from "@ariakit/react";
import type { ChangeEvent } from "react";
import { useState } from "react";

export default function Example() {
  const [fruit, setFruit] = useState("none");

  // Standard React radio idiom: commit the value only when the radio that
  // fired the event is checked. Arrow-key selection silently defeats this
  // gate because the forwarded focus event still has checked === false.
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      setFruit(event.target.value);
    }
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
