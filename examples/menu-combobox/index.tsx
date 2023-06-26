import "./style.css";
import { useDeferredValue, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import list from "./list.js";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const menu = Ariakit.useMenuStore({ combobox });
  const value = combobox.useState("value");
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(() => {
    return matchSorter(list, deferredValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [deferredValue]);

  return (
    <>
      <Ariakit.MenuButton store={menu} className="button">
        Add block
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu store={menu} composite={false} className="menu">
        <Ariakit.MenuArrow />
        <Ariakit.Combobox
          store={combobox}
          autoSelect
          placeholder="Search..."
          className="combobox"
        />
        <Ariakit.ComboboxList store={combobox} className="combobox-list">
          {matches.map((value) => (
            <Ariakit.ComboboxItem
              key={value}
              value={value}
              focusOnHover
              setValueOnClick={false}
              className="menu-item"
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.Menu>
    </>
  );
}
