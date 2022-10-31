import { useMemo } from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  useComboboxState,
} from "ariakit/combobox";
import {
  Menu,
  MenuArrow,
  MenuButton,
  MenuButtonArrow,
  useMenuState,
} from "ariakit/menu";
import { matchSorter } from "match-sorter";
import list from "./list";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState();
  const menu = useMenuState(combobox);
  const matches = useMemo(() => {
    return combobox.value ? matchSorter(list, combobox.value) : list;
  }, [combobox.value]);

  // Resets combobox value when menu is closed
  if (!menu.mounted && combobox.value) {
    combobox.setValue("");
  }

  return (
    <>
      <MenuButton state={menu} className="button">
        Add block
        <MenuButtonArrow />
      </MenuButton>
      <Menu state={menu} composite={false} className="menu">
        <MenuArrow />
        <Combobox
          state={combobox}
          autoSelect
          placeholder="Search..."
          className="combobox"
        />
        <ComboboxList state={combobox} className="combobox-list">
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
