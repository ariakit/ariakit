import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxState({
    defaultValue: [],
  });

  return (
    <div>
      <label className="label">
        <Checkbox className="checkbox" state={checkbox} value="apple" /> Apple
      </label>
      <label className="label">
        <Checkbox className="checkbox" state={checkbox} value="orange" /> Orange
      </label>
      <label className="label">
        <Checkbox className="checkbox" state={checkbox} value="mango" /> Mango
      </label>
    </div>
  );
}
