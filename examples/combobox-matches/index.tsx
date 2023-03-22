import { useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import list from "./list.js";
import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ gutter: 8, sameWidth: true });
  const value = combobox.useState("value");

  const matches = useMemo(() => matchSorter(list, value), [value]);

  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <Ariakit.Combobox
          store={combobox}
          placeholder="e.g., Apple"
          className="combobox"
        />
      </label>
      <Ariakit.ComboboxPopover store={combobox} className="popover">
        {matches.length ? (
          matches.map((value) => (
            <Ariakit.ComboboxItem
              key={value}
              value={value}
              className="combobox-item"
            />
          ))
        ) : (
          <div className="no-results">No results found</div>
        )}
      </Ariakit.ComboboxPopover>
    </div>
  );
}
