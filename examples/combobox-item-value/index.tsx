import * as Ariakit from "@ariakit/react";
import "./style.css";

const fruits = ["Apple", "Grape", "Orange", "Strawberry", "Watermelon"];

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ gutter: 8, sameWidth: true });
  return (
    <div className="wrapper">
      <label className="label">
        Your favorite fruit
        <Ariakit.Combobox
          store={combobox}
          placeholder="e.g., Apple"
          className="combobox"
        />
      </label>
      <Ariakit.ComboboxPopover store={combobox} className="popover">
        {fruits.map((f) => (
          <Ariakit.ComboboxItem key={f} value={f} className="combobox-item">
            <Ariakit.ComboboxItemValue />
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </div>
  );
}
