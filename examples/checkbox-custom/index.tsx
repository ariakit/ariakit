import { useState } from "react";
import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const checkbox = Ariakit.useCheckboxStore({ defaultValue: false });
  const [focusVisible, setFocusVisible] = useState(false);
  const checked = checkbox.useState("value");
  return (
    <label className="label">
      <Ariakit.VisuallyHidden>
        <Ariakit.Checkbox
          store={checkbox}
          onFocusVisible={() => setFocusVisible(true)}
          onBlur={() => setFocusVisible(false)}
        />
      </Ariakit.VisuallyHidden>
      <div className="checkbox" data-focus-visible={focusVisible ? "" : null}>
        <Ariakit.CheckboxCheck checked={checked} />
      </div>
      I have read and agree to the terms and conditions
    </label>
  );
}
