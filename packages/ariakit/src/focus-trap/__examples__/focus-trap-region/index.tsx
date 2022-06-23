import "./style.css";
import { Button } from "ariakit/button";
import { Checkbox, useCheckboxState } from "ariakit/checkbox";
import { FocusTrapRegion } from "ariakit/focus-trap";

export default function Example() {
  const focusTrapped = useCheckboxState({ defaultValue: false });

  return (
    <FocusTrapRegion className="wrapper" enabled={focusTrapped.value}>
      <label className="label">
        <Checkbox state={focusTrapped} className="checkbox" />
        Trap focus
      </label>
      <Button className="button">Button 1</Button>
      <Button className="button">Button 2</Button>
      <Button className="button" disabled>
        Button 3
      </Button>
      <input className="input" title="one" placeholder="Input" />
      <input
        className="input"
        title="two"
        disabled
        placeholder="Disabled input"
      />
    </FocusTrapRegion>
  );
}
