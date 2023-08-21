import "./style.css";
import { Checkbox, useCheckboxStore } from "@ariakit/react";

export default function Example() {
  const checkbox = useCheckboxStore();
  return (
    <div>
      <label className="label">
        <Checkbox store={checkbox} value="accept" className="checkbox" /> I have
        read and agree to the terms and conditions
      </label>
    </div>
  );
}
