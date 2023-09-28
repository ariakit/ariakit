import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider animated>
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
      </Ariakit.ComboboxProvider>
    </div>
  );
}
