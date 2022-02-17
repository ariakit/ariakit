import { useState } from "react";
import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import { VisuallyHidden } from "ariakit/visually-hidden";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxState();
  const [focusVisible, setFocusVisible] = useState(false);
  return (
    <label className="label">
      <VisuallyHidden>
        <Checkbox
          state={checkbox}
          onFocusVisible={() => setFocusVisible(true)}
          onBlur={() => setFocusVisible(false)}
        />
      </VisuallyHidden>
      <div
        className="checkbox"
        data-focus-visible={focusVisible ? "" : undefined}
        data-checked={checkbox.value}
      >
        {checkbox.value ? "Checked" : "Unchecked"}
      </div>
    </label>
  );
}
