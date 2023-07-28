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
  const combobox = Ariakit.useComboboxStore();
  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <div className="combobox-wrapper">
          <Ariakit.Combobox
            store={combobox}
            autoSelect
            placeholder="e.g., Apple"
            className="combobox"
          />
          <Ariakit.ComboboxCancel
            store={combobox}
            className="button secondary combobox-cancel"
          />
        </div>
      </label>
      <Ariakit.ComboboxPopover
        store={combobox}
        gutter={4}
        sameWidth
        className="popover"
      >
        {list.map((value) => (
          <Ariakit.ComboboxItem
            key={value}
            value={value}
            className="combobox-item"
          />
        ))}
      </Ariakit.ComboboxPopover>
    </div>
  );
}
