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
  const combobox = useComboboxState({ gutter: 8, sameWidth: true, list });
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
            className="combobox-cancel"
          />
        </div>
      </label>
      <ComboboxPopover state={combobox} className="popover">
        {combobox.matches.length ? (
          combobox.matches.map((value) => (
            <ComboboxItem key={value} value={value} className="combobox-item" />
          ))
        ) : (
          <div>No results found</div>
        )}
      </ComboboxPopover>
    </div>
  );
}
