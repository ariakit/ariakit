import { Fragment, useMemo } from "react";
import {
  Combobox,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxPopover,
  ComboboxSeparator,
  useComboboxState,
} from "ariakit/combobox";
import groupBy from "lodash/groupBy";
import { matchSorter } from "match-sorter";
import food from "./food";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState({ gutter: 4, sameWidth: true });
  const matches = useMemo(() => {
    const items = matchSorter(food, combobox.value, { keys: ["name"] });
    return Object.entries(groupBy(items, "type"));
  }, [combobox.value]);

  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <Combobox
          state={combobox}
          placeholder="e.g., Apple"
          className="combobox"
          autoComplete="both"
          autoSelect
        />
      </label>
      <ComboboxPopover state={combobox} className="popover">
        {!!matches.length ? (
          matches.map(([type, items], index) => (
            <Fragment key={type}>
              <ComboboxGroup className="group">
                <ComboboxGroupLabel className="group-label">
                  {type}
                </ComboboxGroupLabel>
                {items.map((item, i) => (
                  <ComboboxItem
                    state={combobox}
                    key={type + item.name + i}
                    value={item.name}
                    focusOnHover
                    className="combobox-item"
                  />
                ))}
              </ComboboxGroup>
              {index < matches.length - 1 && (
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
