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
import defaultList from "./list";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState({ defaultList });
  const menu = useMenuState(combobox);

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
          {combobox.matches.map((value) => (
            <ComboboxItem
              key={value}
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
