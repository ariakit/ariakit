import { Fragment, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import groupBy from "lodash/groupBy.js";
import { matchSorter } from "match-sorter";
import food from "./food";
import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ gutter: 4, sameWidth: true });
  const value = combobox.useState("value");

  const matches = useMemo(() => {
    const items = matchSorter(food, value, { keys: ["name"] });
    return Object.entries(groupBy(items, "type"));
  }, [value]);

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
            <Fragment key={type}>
              <Ariakit.ComboboxGroup className="group">
                <Ariakit.ComboboxGroupLabel className="group-label">
                  {type}
                </Ariakit.ComboboxGroupLabel>
                {items.map((item, j) => (
                  <Ariakit.ComboboxItem
                    key={item.name + i + j}
                    value={item.name}
                    focusOnHover
                    className="combobox-item"
                  />
                ))}
              </Ariakit.ComboboxGroup>
              {i < matches.length - 1 && (
                <Ariakit.ComboboxSeparator className="separator" />
              )}
            </Fragment>
          ))
        ) : (
          <div className="no-results">No results found</div>
        )}
      </Ariakit.ComboboxPopover>
    </div>
  );
}
