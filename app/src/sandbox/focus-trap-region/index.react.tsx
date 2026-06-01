import * as Ariakit from "@ariakit/react";
import type { CSSProperties } from "react";
import { useState } from "react";

const sectionStyle = {
  display: "grid",
  gap: 8,
  padding: 16,
  border: "1px solid hsl(0 0% 80%)",
  borderRadius: 8,
} satisfies CSSProperties;

const regionStyle = {
  display: "flex",
  gap: 8,
  alignItems: "center",
} satisfies CSSProperties;

export default function Example() {
  const [multipleEnabled, setMultipleEnabled] = useState(false);
  const [singleEnabled, setSingleEnabled] = useState(false);
  const [emptyEnabled, setEmptyEnabled] = useState(false);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={sectionStyle}>
        <button>Before multiple</button>
        <Ariakit.FocusTrapRegion
          aria-label="Multiple focus trap"
          enabled={multipleEnabled}
          style={regionStyle}
        >
          <label>
            <input
              checked={multipleEnabled}
              onChange={(event) => setMultipleEnabled(event.target.checked)}
              // WebKit focuses the clicked checkbox only when explicitly tabbable.
              tabIndex={0}
              type="checkbox"
            />{" "}
            Trap multiple
          </label>
          <Ariakit.Button>Button 1</Ariakit.Button>
          <Ariakit.Button>Button 2</Ariakit.Button>
          <label>
            Multi input
            <input />
          </label>
        </Ariakit.FocusTrapRegion>
        <button>After multiple</button>
      </section>

      <section style={sectionStyle}>
        <label>
          <input
            checked={singleEnabled}
            onChange={(event) => setSingleEnabled(event.target.checked)}
            type="checkbox"
          />{" "}
          Enable single trap
        </label>
        <button>Before single</button>
        <Ariakit.FocusTrapRegion
          aria-label="Single focus trap"
          enabled={singleEnabled}
          style={regionStyle}
        >
          <Ariakit.Button>Single button</Ariakit.Button>
        </Ariakit.FocusTrapRegion>
        <button>After single</button>
      </section>

      <section style={sectionStyle}>
        <label>
          <input
            checked={emptyEnabled}
            onChange={(event) => setEmptyEnabled(event.target.checked)}
            type="checkbox"
          />{" "}
          Enable empty trap
        </label>
        <button>Before empty</button>
        <Ariakit.FocusTrapRegion
          aria-label="Empty focus trap"
          enabled={emptyEnabled}
          role="region"
          style={regionStyle}
          tabIndex={-1}
        >
          <Ariakit.Button disabled>Disabled button</Ariakit.Button>
        </Ariakit.FocusTrapRegion>
        <button>After empty</button>
      </section>
    </div>
  );
}
