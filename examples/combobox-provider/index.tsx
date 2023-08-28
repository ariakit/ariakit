import "./style.css";
import * as Ariakit from "@ariakit/react";
import { ComboboxProvider } from "@ariakit/react-core/combobox/combobox-provider";

export default function Example() {
  return (
    <div className="wrapper">
      <ComboboxProvider>
        <label className="label">
          Your favorite fruit
          <Ariakit.Combobox placeholder="e.g., Apple" className="combobox" />
        </label>
        <Ariakit.ComboboxPopover gutter={4} sameWidth className="popover">
          <Ariakit.ComboboxItem className="combobox-item" value="Apple">
            🍎 Apple
          </Ariakit.ComboboxItem>
          <Ariakit.ComboboxItem className="combobox-item" value="Grape">
            🍇 Grape
          </Ariakit.ComboboxItem>
          <Ariakit.ComboboxItem className="combobox-item" value="Orange">
            🍊 Orange
          </Ariakit.ComboboxItem>
          <Ariakit.ComboboxItem className="combobox-item" value="Strawberry">
            🍓 Strawberry
          </Ariakit.ComboboxItem>
          <Ariakit.ComboboxItem className="combobox-item" value="Watermelon">
            🍉 Watermelon
          </Ariakit.ComboboxItem>
        </Ariakit.ComboboxPopover>
      </ComboboxProvider>
    </div>
  );
}
