import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { useDeferredValue, useMemo } from "react";
import list from "../select-combobox/list.ts";
import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({
    defaultSelectedValue: "Apple",
    resetValueOnHide: true,
  });

  const value = Ariakit.useStoreState(combobox, "value");
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(() => {
    return matchSorter(list, deferredValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [deferredValue]);

  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider store={combobox}>
        <Ariakit.ComboboxLabel>Favorite fruit</Ariakit.ComboboxLabel>
        <Ariakit.ComboboxSelect className="button" />
        <Ariakit.ComboboxPopover gutter={4} sameWidth className="popover">
          <div className="combobox-wrapper">
            <Ariakit.Combobox
              autoSelect
              placeholder="Search..."
              className="combobox"
            />
          </div>
          <Ariakit.ComboboxList>
            {matches.map((value) => (
              <Ariakit.ComboboxItem
                key={value}
                value={value}
                focusOnHover
                className="select-item"
              />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
