import "./style.css";
import { startTransition, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { ComboboxProvider } from "@ariakit/react-core/combobox/combobox-provider";
import { matchSorter } from "match-sorter";
import list from "./list.js";

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const matches = useMemo(() => matchSorter(list, searchValue), [searchValue]);
  return (
    <div className="wrapper">
      <ComboboxProvider
        setValue={(value) => {
          startTransition(() => setSearchValue(value));
        }}
      >
        <label className="label">
          Your favorite food
          <Ariakit.Combobox placeholder="e.g., Apple" className="combobox" />
        </label>
        <Ariakit.ComboboxPopover gutter={8} sameWidth className="popover">
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
      </ComboboxProvider>
    </div>
  );
}
