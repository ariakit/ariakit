import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const radio = Ariakit.useRadioStore();
  return (
    <Ariakit.RadioGroup store={radio}>
      <label className="label">
        <Ariakit.Radio className="radio" value="apple" />
        apple
      </label>
      <label className="label">
        <Ariakit.Radio className="radio" value="orange" />
        orange
      </label>
      <label className="label">
        <Ariakit.Radio className="radio" value="watermelon" />
        watermelon
      </label>
    </Ariakit.RadioGroup>
  );
}
