import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Ariakit.Button>Button</Ariakit.Button>
      <label>
        <Ariakit.Checkbox
          checked={checked}
          onChange={() => setChecked((c) => !c)}
        />{" "}
        Checkbox
      </label>
      <Ariakit.RadioProvider>
        <label>
          <Ariakit.Radio value="a" /> Radio A
        </label>
        <label>
          <Ariakit.Radio value="b" /> Radio B
        </label>
      </Ariakit.RadioProvider>
    </div>
  );
}
