import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState({ gutter: 8 });
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
      <ComboboxPopover state={combobox} aria-label="Fruits" className="popover">
        <ComboboxItem value="Apple">🍎 Apple</ComboboxItem>
        <ComboboxItem value="Grape">🍇 Grape</ComboboxItem>
        <ComboboxItem value="Orange">🍊 Orange</ComboboxItem>
        <ComboboxItem value="Strawberry">🍓 Strawberry</ComboboxItem>
        <ComboboxItem value="Watermelon">🍉 Watermelon</ComboboxItem>
      </ComboboxPopover>
    </div>
  );
}
