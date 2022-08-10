import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState({
    gutter: 8,
    sameWidth: true,
  });

  return (
    <div>
      <label className="label">
        Your favorite fruit
        <Combobox
          state={combobox}
          placeholder="e.g., Apple"
          className="combobox"
          showOnMouseDown={false}
          showOnKeyDown={false}
        />
      </label>

      <ComboboxPopover state={combobox} className="popover">
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
