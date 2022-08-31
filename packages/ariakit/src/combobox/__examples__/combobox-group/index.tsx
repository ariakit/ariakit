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
import food from "./food";
import "./style.css";

const list = food.map((item) => item.name);

export default function Example() {
  const combobox = useComboboxState({ gutter: 8, sameWidth: true, list });

  // Transform combobox.matches into groups of objects.
  const matches = useMemo(() => {
    const items = combobox.matches
      .map((value) => food.find((item) => item.name === value)!)
      .filter(Boolean);
    return Object.entries(groupBy(items, "type"));
  }, [combobox.matches]);

  return (
    <div>
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
          matches.map(([type, items], index, array) => (
            <Fragment key={type}>
              <ComboboxGroup className="group">
                <ComboboxGroupLabel className="group-label">
                  {type}
                </ComboboxGroupLabel>
                {items.map((item, i) => (
                  <ComboboxItem
                    key={item.name + i}
                    value={item.name}
                    focusOnHover
                    className="combobox-item"
                  />
                ))}
              </ComboboxGroup>
              {index < array.length - 1 && (
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
