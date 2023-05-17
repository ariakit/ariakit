import { useDeferredValue, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import list from "./list.js";
import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const select = Ariakit.useSelectStore({ combobox, defaultValue: "Apple" });

  const value = combobox.useState("value");
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(() => {
    return matchSorter(list, deferredValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [deferredValue]);

  return (
    <div className="wrapper">
      <Ariakit.SelectLabel store={select}>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} className="select" />
      <Ariakit.SelectPopover
        store={select}
        gutter={4}
        sameWidth
        className="popover"
      >
        <div className="combobox-wrapper">
          <Ariakit.Combobox
            store={combobox}
            autoSelect
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
              render={(p) => <Ariakit.SelectItem {...p} value={value} />}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.SelectPopover>
    </div>
  );
}
