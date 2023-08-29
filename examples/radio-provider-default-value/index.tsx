import "./style.css";
import * as Ariakit from "@ariakit/react";
import { RadioProvider } from "@ariakit/react-core/radio/radio-provider";

export default function Example() {
  return (
    <RadioProvider defaultValue="orange">
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
    </RadioProvider>
  );
}
