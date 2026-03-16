import * as Ariakit from "@ariakit/react";

import "./style.css";

export default function Example() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.ComboboxLabel className="label">
        Your favorite food
      </Ariakit.ComboboxLabel>
      <div className="combobox-wrapper">
        <Ariakit.Combobox placeholder="e.g., Pizza" className="combobox" />
        <Ariakit.ComboboxDisclosure className="button secondary disclosure" />
      </div>
      <Ariakit.ComboboxPopover gutter={4} sameWidth className="popover">
        <Ariakit.ComboboxItem className="combobox-item" value="Pizza">
          🍕 Pizza
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Burger">
          🍔 Burger
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Spaghetti">
          🍝 Spaghetti
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Sushi">
          🍣 Sushi
        </Ariakit.ComboboxItem>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
