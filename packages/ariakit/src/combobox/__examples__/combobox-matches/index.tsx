import { useMemo } from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxStore,
} from "ariakit/combobox/store";
import { matchSorter } from "match-sorter";
import list from "./list";
import "./style.css";

export default function Example() {
  const combobox = useComboboxStore({ gutter: 8, sameWidth: true });
  const value = combobox.useState("value");

  const matches = useMemo(() => matchSorter(list, value), [value]);

  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <Combobox
          store={combobox}
          placeholder="e.g., Apple"
          className="combobox"
        />
      </label>
      <ComboboxPopover store={combobox} className="popover">
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
