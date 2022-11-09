import { Fragment, useMemo } from "react";
import {
  Combobox,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxPopover,
  ComboboxSeparator,
  useComboboxStore,
} from "ariakit/combobox/store";
import groupBy from "lodash/groupBy";
import { matchSorter } from "match-sorter";
import food from "./food";
import "./style.css";

export default function Example() {
  const combobox = useComboboxStore({ gutter: 4, sameWidth: true });
  const value = combobox.useState("value");

  const matches = useMemo(() => {
    const items = matchSorter(food, value, { keys: ["name"] });
    return Object.entries(groupBy(items, "type"));
  }, [value]);

  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <Combobox
          store={combobox}
          placeholder="e.g., Apple"
          className="combobox"
          autoComplete="both"
          autoSelect
        />
      </label>
      <ComboboxPopover store={combobox} className="popover">
        {!!matches.length ? (
          matches.map(([type, items], i) => (
            <Fragment key={type}>
              <ComboboxGroup className="group">
                <ComboboxGroupLabel className="group-label">
                  {type}
                </ComboboxGroupLabel>
                {items.map((item, j) => (
                  <ComboboxItem
                    key={item.name + i + j}
                    value={item.name}
                    focusOnHover
                    className="combobox-item"
                  />
                ))}
              </ComboboxGroup>
              {i < matches.length - 1 && (
                <ComboboxSeparator className="separator" />
              )}
            </Fragment>
          ))
        ) : (
          <div className="no-results">No results found</div>
        )}
      </ComboboxPopover>
    </div>
  );
}
