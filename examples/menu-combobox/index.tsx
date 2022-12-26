import { useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import list from "./list";
import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const menu = Ariakit.useMenuStore({ combobox });
  const value = combobox.useState("value");

  const matches = useMemo(() => {
    return matchSorter(list, value, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [value]);

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
          {matches.map((value, i) => (
            <Ariakit.ComboboxItem
              key={value + i}
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
