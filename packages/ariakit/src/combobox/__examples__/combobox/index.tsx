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
        Fruit
        <Combobox
          state={combobox}
          placeholder="Start typing some fruit"
          className="combobox"
        />
      </label>
      <ComboboxPopover state={combobox} className="combobox-popover">
        <ComboboxItem value="Apple" />
        <ComboboxItem value="Orange" />
        <ComboboxItem value="Watermelon" />
      </ComboboxPopover>
    </div>
  );
}
