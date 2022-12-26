import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({
    gutter: 4,
    sameWidth: true,
    animated: true,
  });
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
    </div>
  );
}
