import {
  Combobox,
  ComboboxItem,
  ComboboxItemValue,
  ComboboxPopover,
  useComboboxStore,
} from "ariakit/combobox/store";
import "./style.css";

const fruits = ["Apple", "Grape", "Orange", "Strawberry", "Watermelon"];

export default function Example() {
  const combobox = useComboboxStore({ gutter: 8, sameWidth: true });
  return (
    <div className="wrapper">
      <label className="label">
        Your favorite fruit
        <Combobox
          store={combobox}
          placeholder="e.g., Apple"
          className="combobox"
        />
      </label>
      <ComboboxPopover store={combobox} className="popover">
        {fruits.map((f) => (
          <ComboboxItem key={f} value={f} className="combobox-item">
            <ComboboxItemValue />
          </ComboboxItem>
        ))}
      </ComboboxPopover>
    </div>
  );
}
