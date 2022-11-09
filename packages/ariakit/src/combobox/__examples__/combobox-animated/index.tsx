import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxStore,
} from "ariakit/combobox/store";
import "./style.css";

export default function Example() {
  const combobox = useComboboxStore({
    gutter: 4,
    sameWidth: true,
    animated: true,
  });
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
        <ComboboxItem className="combobox-item" value="Apple">
          🍎 Apple
        </ComboboxItem>
        <ComboboxItem className="combobox-item" value="Grape">
          🍇 Grape
        </ComboboxItem>
        <ComboboxItem className="combobox-item" value="Orange">
          🍊 Orange
        </ComboboxItem>
        <ComboboxItem className="combobox-item" value="Strawberry">
          🍓 Strawberry
        </ComboboxItem>
        <ComboboxItem className="combobox-item" value="Watermelon">
          🍉 Watermelon
        </ComboboxItem>
      </ComboboxPopover>
    </div>
  );
}
