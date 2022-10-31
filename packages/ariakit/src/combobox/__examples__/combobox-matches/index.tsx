import { useMemo } from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import { matchSorter } from "match-sorter";
import list from "./list";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState({ gutter: 8, sameWidth: true });
  const matches = useMemo(
    () => matchSorter(list, combobox.value),
    [combobox.value]
  );
  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <Combobox
          state={combobox}
          placeholder="e.g., Apple"
          className="combobox"
        />
      </label>
      <ComboboxPopover state={combobox} className="popover">
        {matches.length ? (
          matches.map((value) => (
            <ComboboxItem key={value} value={value} className="combobox-item" />
          ))
        ) : (
          <div className="no-results">No results found</div>
        )}
      </ComboboxPopover>
    </div>
  );
}
