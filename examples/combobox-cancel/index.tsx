import "./style.css";
import * as Ariakit from "@ariakit/react";

const list = [
  "Apple",
  "Bacon",
  "Banana",
  "Broccoli",
  "Burger",
  "Cake",
  "Candy",
];

export default function Example() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.ComboboxLabel className="label">
        Your favorite food
      </Ariakit.ComboboxLabel>
      <div className="combobox-wrapper">
        <Ariakit.Combobox
          autoSelect
          placeholder="e.g., Apple"
          className="combobox"
        />
        <Ariakit.ComboboxCancel className="button secondary combobox-cancel" />
      </div>
      <Ariakit.ComboboxPopover gutter={4} sameWidth className="popover">
        {list.map((value) => (
          <Ariakit.ComboboxItem
            key={value}
            value={value}
            className="combobox-item"
          />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
