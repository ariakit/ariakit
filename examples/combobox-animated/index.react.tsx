import * as Ariakit from "@ariakit/react";

import "./style.css";

export default function Example() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.ComboboxLabel className="label">
        Your favorite fruit
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox placeholder="e.g., Apple" className="combobox" />
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
  );
}
