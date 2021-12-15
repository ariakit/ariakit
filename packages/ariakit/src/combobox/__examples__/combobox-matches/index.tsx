import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import list from "./list";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState({ gutter: 8, list });
  return (
    <div>
      <label className="label">
        Your favorite food
        <Combobox
          state={combobox}
          placeholder="e.g., Apple"
          className="combobox"
        />
      </label>
      <ComboboxPopover state={combobox} className="popover">
        {combobox.matches.length ? (
          combobox.matches.map((value) => (
            <ComboboxItem key={value} value={value} />
          ))
        ) : (
          <div>No results found</div>
        )}
      </ComboboxPopover>
    </div>
  );
}
