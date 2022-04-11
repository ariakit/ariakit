import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxState();
  return (
    <Checkbox as="button" state={checkbox} className="checkbox">
      {checkbox.value ? "Checked" : "Unchecked"}
    </Checkbox>
  );
}
