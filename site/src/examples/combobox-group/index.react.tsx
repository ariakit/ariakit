import groupBy from "lodash-es/groupBy.js";
import { matchSorter } from "match-sorter";
import * as React from "react";
import {
  Combobox,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSeparator,
} from "./combobox.react.tsx";
import food from "./food.ts";

export default function Example() {
  const [value, setValue] = React.useState("");
  const deferredValue = React.useDeferredValue(value);

  const matches = React.useMemo(() => {
    const items = matchSorter(food, deferredValue, { keys: ["name"] });
    return Object.entries(groupBy(items, "type"));
  }, [deferredValue]);

  return (
    <label className="flex flex-col gap-2 p-0 indent-2">
      Your favorite food
      <Combobox
        autoSelect
        autoComplete="both"
        placeholder="e.g., Apple"
        value={value}
        onChange={setValue}
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
          <div className="p-2 gap-2">No results found</div>
        )}
      </Combobox>
    </label>
  );
}
