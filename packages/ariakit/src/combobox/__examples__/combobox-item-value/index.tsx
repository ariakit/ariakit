import {
  Combobox,
  ComboboxItem,
  ComboboxItemValue,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import "./style.css";

const fruits = ["Apple", "Grape", "Orange", "Strawberry", "Watermelon"];

export default function Example() {
  const combobox = useComboboxState({ gutter: 8, sameWidth: true });
  return (
    <div>
      <label className="label">
        Your favorite fruit
        <Combobox
          state={combobox}
          placeholder="e.g., Apple"
          className="combobox"
        />
      </label>
      <ComboboxPopover state={combobox} className="popover">
        {fruits.map((f) => (
          <ComboboxItem key={f} value={f} className="combobox-item">
            <ComboboxItemValue />
          </ComboboxItem>
        ))}
      </ComboboxPopover>
    </div>
  );
}
