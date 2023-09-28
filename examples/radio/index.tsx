import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.RadioProvider>
      <Ariakit.RadioGroup>
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
    </Ariakit.RadioProvider>
  );
}
