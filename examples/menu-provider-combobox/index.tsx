import "./style.css";
import { startTransition, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { ComboboxProvider } from "@ariakit/react-core/combobox/combobox-provider";
import { MenuProvider } from "@ariakit/react-core/menu/menu-provider";
import { matchSorter } from "match-sorter";
import list from "./list.js";

export default function Example() {
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    return matchSorter(list, searchValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [searchValue]);

  return (
    <ComboboxProvider
      resetValueOnHide
      setValue={(value) => {
        startTransition(() => {
          setSearchValue(value);
        });
      }}
    >
      <MenuProvider>
        <Ariakit.MenuButton className="button">
          Add block
          <Ariakit.MenuButtonArrow />
        </Ariakit.MenuButton>
        <Ariakit.Menu className="menu">
          <Ariakit.MenuArrow />
          <Ariakit.Combobox
            autoSelect
            placeholder="Search..."
            className="combobox"
          />
          <Ariakit.ComboboxList className="combobox-list">
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
      </MenuProvider>
    </ComboboxProvider>
  );
}
