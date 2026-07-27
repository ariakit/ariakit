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
      <Ariakit.ComboboxSelectLabel store={combobox}>
        Favorite fruit
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={combobox} className="button" />
      <Ariakit.ComboboxPopover
        store={combobox}
        gutter={4}
        sameWidth
        className="popover"
      >
        <div className="combobox-wrapper">
          <Ariakit.ComboboxInput
            store={combobox}
            autoSelect
            aria-label="Search fruits"
            placeholder="Search..."
            className="combobox"
          />
        </div>
        <Ariakit.ComboboxList store={combobox}>
          {matches.map((value) => (
            <Ariakit.ComboboxItem
              key={value}
              focusOnHover
              className="select-item"
              value={value}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </div>
  );
}
