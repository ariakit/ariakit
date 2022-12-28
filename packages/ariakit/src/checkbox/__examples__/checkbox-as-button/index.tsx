import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxState();
  return (
    <Checkbox as="button" state={checkbox} className="button">
      {checkbox.value ? "Checked" : "Unchecked"}
    </Checkbox>
  );
}
