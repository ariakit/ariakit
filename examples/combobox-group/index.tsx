import "./style.css";
import * as React from "react";
import groupBy from "lodash-es/groupBy.js";
import { matchSorter } from "match-sorter";
import {
  Combobox,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSeparator,
} from "./combobox.jsx";
import food from "./food.js";

export default function Example() {
  const [value, setValue] = React.useState("");
  const deferredValue = React.useDeferredValue(value);

  const matches = React.useMemo(() => {
    const items = matchSorter(food, deferredValue, { keys: ["name"] });
    return Object.entries(groupBy(items, "type"));
  }, [deferredValue]);

  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <Combobox
          value={value}
          onChange={setValue}
          autoSelect
          autoComplete="both"
          placeholder="e.g., Apple"
        >
          {matches.length ? (
            matches.map(([type, items], i) => (
              <React.Fragment key={type}>
                <ComboboxGroup label={type}>
                  {items.map((item) => (
                    <ComboboxItem key={item.name} value={item.name} />
                  ))}
                </ComboboxGroup>
                {i < matches.length - 1 && <ComboboxSeparator />}
              </React.Fragment>
            ))
          ) : (
            <div className="no-results">No results found</div>
          )}
        </Combobox>
      </label>
    </div>
  );
}
