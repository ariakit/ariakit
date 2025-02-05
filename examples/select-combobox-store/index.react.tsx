import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { useDeferredValue, useMemo } from "react";
import list from "../select-combobox/list.ts";
import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const select = Ariakit.useSelectStore({ combobox, defaultValue: "Apple" });

  const value = Ariakit.useStoreState(combobox, "value");
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(() => {
    return matchSorter(list, deferredValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [deferredValue]);

  return (
    <div className="wrapper">
      <Ariakit.SelectLabel store={select}>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} className="button" />
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
              render={<Ariakit.SelectItem value={value} />}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.SelectPopover>
    </div>
  );
}
