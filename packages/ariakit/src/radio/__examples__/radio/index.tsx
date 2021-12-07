import { Radio, RadioGroup, useRadioState } from "ariakit/radio";
import "./style.css";

export default function Example() {
  const radio = useRadioState();
  return (
    <RadioGroup state={radio}>
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
