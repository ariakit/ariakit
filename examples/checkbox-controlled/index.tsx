import { useState } from "react";
import { Checkbox } from "@ariakit/react";
import "./style.css";

export default function Example() {
  const [checked, setChecked] = useState(true);
  return (
    <label className="label">
      <Checkbox
        className="checkbox"
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
      I have read and agree to the terms and conditions
    </label>
  );
}
