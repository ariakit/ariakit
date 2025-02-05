import { Checkbox, useCheckboxStore, useStoreState } from "@ariakit/react";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxStore();
  const label = useStoreState(checkbox, (state) =>
    state.value ? "Checked" : "Unchecked",
  );
  return (
    <Checkbox store={checkbox} className="button" render={<button />}>
      {label}
    </Checkbox>
  );
}
