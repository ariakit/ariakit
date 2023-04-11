import { Checkbox, useCheckboxStore } from "@ariakit/react";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxStore();
  const label = checkbox.useState((state) =>
    state.value ? "Checked" : "Unchecked"
  );
  return (
    <Checkbox as="button" store={checkbox} className="button">
      {label}
    </Checkbox>
  );
}
