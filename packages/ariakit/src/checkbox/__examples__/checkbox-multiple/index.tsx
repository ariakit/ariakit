import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import "./style.css";

export default function Example() {
  const checkbox = useCheckboxState({ defaultValue: [] });

  return (
    <div>
      <div>Choices:{checkbox.value.join(", ")}</div>
      <div className="wrapper">
        <label>
          <Checkbox state={checkbox} value="apple" />
          apple
        </label>
        <label>
          <Checkbox state={checkbox} value="orange" />
          orange
        </label>
        <label>
          <Checkbox state={checkbox} value="watermelon" />
          watermelon
        </label>
      </div>
    </div>
  );
}
