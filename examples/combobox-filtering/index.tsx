import "./style.css";
import { startTransition, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import list from "./list.js";

export default function Example() {
  const [searchValue, setSearchValue] = useState("");

  const combobox = Ariakit.useComboboxStore({
    setValue(value) {
      startTransition(() => setSearchValue(value));
    },
  });

  const matches = useMemo(() => matchSorter(list, searchValue), [searchValue]);

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
      <Ariakit.ComboboxPopover
        store={combobox}
        gutter={8}
        sameWidth
        className="popover"
      >
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
