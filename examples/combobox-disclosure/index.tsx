import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider>
        <label className="label">
          Your favorite food
          <div className="combobox-wrapper">
            <Ariakit.Combobox placeholder="e.g., Pizza" className="combobox" />
            <Ariakit.ComboboxDisclosure className="button secondary disclosure" />
          </div>
        </label>
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
    </div>
  );
}
