import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const checkbox = Ariakit.useCheckboxStore({ defaultValue: false });
  const focusTrapped = checkbox.useState("value");
  return (
    <Ariakit.FocusTrapRegion className="wrapper" enabled={focusTrapped}>
      <label className="label">
        <Ariakit.Checkbox store={checkbox} className="checkbox" />
        Trap focus
      </label>
      <Ariakit.Button className="button">Button 1</Ariakit.Button>
      <Ariakit.Button className="button">Button 2</Ariakit.Button>
      <Ariakit.Button className="button" disabled>
        Button 3
      </Ariakit.Button>
      <input className="input" title="one" placeholder="Input" />
      <input
        className="input"
        title="two"
        disabled
        placeholder="Disabled input"
      />
    </Ariakit.FocusTrapRegion>
  );
}
