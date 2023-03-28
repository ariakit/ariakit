import { useDeferredValue, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import list from "./list.js";
import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const select = Ariakit.useSelectStore({
    combobox,
    defaultValue: "Apple",
    gutter: 4,
    sameWidth: true,
  });

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
        composite={false}
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
          {matches.map((value, i) => (
            <Ariakit.ComboboxItem
              key={value + i}
              focusOnHover
              className="select-item"
            >
              {(props) => <Ariakit.SelectItem {...props} value={value} />}
            </Ariakit.ComboboxItem>
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.SelectPopover>
    </div>
  );
}
