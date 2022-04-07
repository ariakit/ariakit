import {
  Combobox,
  ComboboxCancel,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import list from "./list";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState({ gutter: 8, sameWidth: true });
  return (
    <div>
      <label className="label">
        Your favorite food
        <div className="combobox-wrapper">
          <Combobox
            state={combobox}
            placeholder="e.g., Apple"
            className="combobox"
          />
          <ComboboxCancel
            role="button"
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
