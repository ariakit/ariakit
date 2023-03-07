import { Checkbox, useCheckboxState } from "ariakit/checkbox";

import "./style.css";

export default function Example() {
  const checkbox = useCheckboxState();
  return (
    <div>
      <label className="label">
        <Checkbox state={checkbox} value="accept" className="checkbox" /> I have
        read and agree to the terms and conditions
      </label>
    </div>
  );
}
