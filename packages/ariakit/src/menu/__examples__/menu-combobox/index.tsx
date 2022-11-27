import { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  useComboboxStore,
} from "ariakit/combobox/store";
import {
  Menu,
  MenuArrow,
  MenuButton,
  MenuButtonArrow,
  useMenuStore,
} from "ariakit/menu/store";
import { matchSorter } from "match-sorter";
import list from "./list";
import "./style.css";

export default function Example() {
  const [value, setValue] = useState("");
  const combobox = useComboboxStore({ value, setValue });
  const menu = useMenuStore(combobox.useWithout("contentElement"));

  const matches = useMemo(() => {
    return matchSorter(list, value, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [value]);

  const mounted = menu.useState("mounted");

  // Resets combobox value when menu is closed
  if (!mounted && value) {
    setValue("");
  }

  return (
    <>
      <MenuButton store={menu} className="button">
        Add block
        <MenuButtonArrow />
      </MenuButton>
      <Menu store={menu} composite={false} className="menu">
        <MenuArrow />
        <Combobox
          store={combobox}
          autoSelect
          placeholder="Search..."
          className="combobox"
        />
        <ComboboxList store={combobox} className="combobox-list">
          {matches.map((value, i) => (
            <ComboboxItem
              key={value + i}
              value={value}
              focusOnHover
              setValueOnClick={false}
              className="menu-item"
            />
          ))}
        </ComboboxList>
      </Menu>
    </>
  );
}
