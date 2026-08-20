import * as Ariakit from "@ariakit/react";
import type { ComponentProps } from "react";
import { forwardRef, useState } from "react";

const CustomCheckbox = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  function CustomCheckbox(props, ref) {
    return <input ref={ref} {...props} type="checkbox" />;
  },
);

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
      <Ariakit.Button render={<input type="submit" value="Submit" />} />
      <label>
        <Ariakit.Checkbox
          checked={checked}
          onChange={() => setChecked((c) => !c)}
          render={<CustomCheckbox />}
        />{" "}
        Wrapped
      </label>
      {/* https://github.com/ariakit/ariakit/issues/7215 */}
      <Ariakit.Focusable
        render={<form aria-label="Node editor" style={{ padding: 16 }} />}
        tabIndex={0}
      >
        <input aria-label="Node type" name="nodeType" />
      </Ariakit.Focusable>
    </div>
  );
}
