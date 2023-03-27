import * as React from "react";
import * as Ariakit from "@ariakit/react";
import groupBy from "lodash/groupBy.js";
import { matchSorter } from "match-sorter";
import food from "./food.js";
import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ gutter: 4, sameWidth: true });
  const value = combobox.useState("value");
  const deferredValue = React.useDeferredValue(value);

  const matches = React.useMemo(() => {
    const items = matchSorter(food, deferredValue, { keys: ["name"] });
    return Object.entries(groupBy(items, "type"));
  }, [deferredValue]);

  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <Ariakit.Combobox
          store={combobox}
          placeholder="e.g., Apple"
          className="combobox"
          autoComplete="both"
          autoSelect
        />
      </label>
      <Ariakit.ComboboxPopover store={combobox} className="popover">
        {!!matches.length ? (
          matches.map(([type, items], i) => (
            <React.Fragment key={type}>
              <Ariakit.ComboboxGroup className="group">
                <Ariakit.ComboboxGroupLabel className="group-label">
                  {type}
                </Ariakit.ComboboxGroupLabel>
                {items.map((item) => (
                  <Ariakit.ComboboxItem
                    key={item.name}
                    value={item.name}
                    focusOnHover
                    className="combobox-item"
                  />
                ))}
              </Ariakit.ComboboxGroup>
              {i < matches.length - 1 && (
                <Ariakit.ComboboxSeparator className="separator" />
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="no-results">No results found</div>
        )}
      </Ariakit.ComboboxPopover>
    </div>
  );
}
