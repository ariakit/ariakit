import * as Ariakit from "@ariakit/react";

import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore();
  return (
    <>
      <Ariakit.ComboboxLabel store={combobox} className="label">
        Your favorite fruit
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox
        store={combobox}
        placeholder="e.g., Apple"
        className="combobox"
        autoComplete="inline"
      />
      <Ariakit.ComboboxPopover
        store={combobox}
        gutter={8}
        sameWidth
        className="popover"
      >
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
    </>
  );
}
