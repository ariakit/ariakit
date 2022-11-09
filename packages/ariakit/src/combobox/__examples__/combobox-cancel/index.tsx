import {
  Combobox,
  ComboboxCancel,
  ComboboxItem,
  ComboboxPopover,
  useComboboxStore,
} from "ariakit/combobox/store";
import "./style.css";

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
  const combobox = useComboboxStore({ gutter: 4, sameWidth: true });
  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <div className="combobox-wrapper">
          <Combobox
            store={combobox}
            autoSelect
            placeholder="e.g., Apple"
            className="combobox"
          />
          <ComboboxCancel
            store={combobox}
            className="button secondary combobox-cancel"
          />
        </div>
      </label>
      <ComboboxPopover store={combobox} className="popover">
        {list.map((value) => (
          <ComboboxItem key={value} value={value} className="combobox-item" />
        ))}
      </ComboboxPopover>
    </div>
  );
}
