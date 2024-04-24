import { Checkbox, useCheckboxStore } from "@ariakit/react";
import "./style.css";

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
