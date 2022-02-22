import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import "./style.css";

export default function Example() {
  const checked = useCheckboxState({ defaultValue: true });
  return (
    <label className="label">
      <Checkbox className="checkbox" state={checked} /> I have read and agree to
      the terms and conditions
    </label>
  );
}
