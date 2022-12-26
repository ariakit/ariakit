import { Radio, RadioGroup, useRadioStore } from "@ariakit/react";
import "./style.css";

export default function Example() {
  const radio = useRadioStore();
  return (
    <RadioGroup store={radio}>
      <label className="label">
        <Radio className="radio" value="apple" />
        apple
      </label>
      <label className="label">
        <Radio className="radio" value="orange" />
        orange
      </label>
      <label className="label">
        <Radio className="radio" value="watermelon" />
        watermelon
      </label>
    </RadioGroup>
  );
}
