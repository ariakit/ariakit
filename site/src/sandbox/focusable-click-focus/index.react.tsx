import * as Ariakit from "@ariakit/react";
import type { ComponentProps } from "react";
import { forwardRef, useState } from "react";

const CustomCheckbox = forwardRef<
  HTMLInputElement,
  ComponentProps<"input"> & { type?: string }
>((props, ref) => <input ref={ref} type="checkbox" {...props} />);

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
    </div>
  );
}
