import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <Ariakit.RadioProvider>
      <Ariakit.RadioGroup className="radio-group">
        <Ariakit.RadioGroupLabel className="radio-group-label">
          Favorite fruit
        </Ariakit.RadioGroupLabel>
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
