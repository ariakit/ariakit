import * as Ariakit from "@ariakit/react";
import "./style.css";

const fruits = ["Apple", "Grape", "Orange", "Strawberry", "Watermelon"];

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
      />
      <Ariakit.ComboboxPopover
        store={combobox}
        gutter={8}
        sameWidth
        className="popover"
      >
        {fruits.map((f) => (
          <Ariakit.ComboboxItem key={f} value={f} className="combobox-item">
            <Ariakit.ComboboxItemValue />
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </>
  );
}
