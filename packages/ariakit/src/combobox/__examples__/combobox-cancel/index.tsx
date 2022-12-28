import {
  Combobox,
  ComboboxCancel,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
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
  const combobox = useComboboxState({ gutter: 4, sameWidth: true });
  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <div className="combobox-wrapper">
          <Combobox
            state={combobox}
            autoSelect
            placeholder="e.g., Apple"
            className="combobox"
          />
          <ComboboxCancel
            state={combobox}
            className="button secondary combobox-cancel"
          />
        </div>
      </label>
      <ComboboxPopover state={combobox} className="popover">
        {list.map((value) => (
          <ComboboxItem key={value} value={value} className="combobox-item" />
        ))}
      </ComboboxPopover>
    </div>
  );
}
