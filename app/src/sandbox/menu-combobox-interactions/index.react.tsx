import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import list from "./list.ts";

function getMatches(value: string) {
  return matchSorter(list, value, {
    baseSort: (firstItem, secondItem) =>
      firstItem.index < secondItem.index ? -1 : 1,
  });
}

interface MenuComboboxProps {
  buttonLabel: string;
  combobox?: Ariakit.ComboboxStore;
  matches: string[];
  menu?: Ariakit.MenuStore;
  searchLabel: string;
}

function MenuCombobox({
  buttonLabel,
  combobox,
  matches,
  menu,
  searchLabel,
}: MenuComboboxProps) {
  return (
    <>
      <Ariakit.MenuButton store={menu} className="button">
        {buttonLabel}
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu store={menu} className="menu">
        <Ariakit.MenuArrow />
        <Ariakit.Combobox
          store={combobox}
          autoSelect
          aria-label={searchLabel}
          placeholder="Search..."
          className="combobox"
        />
        <Ariakit.ComboboxList store={combobox} className="combobox-list">
          {matches.map((value) => (
            <Ariakit.ComboboxItem
              key={value}
              store={combobox}
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

function ProviderMenu() {
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => getMatches(searchValue), [searchValue]);

  return (
    <Ariakit.ComboboxProvider
      resetValueOnHide
      setValue={(value) => {
        startTransition(() => {
          setSearchValue(value);
        });
      }}
    >
      <Ariakit.MenuProvider>
        <MenuCombobox
          buttonLabel="Provider Add block"
          matches={matches}
          searchLabel="Search provider blocks"
        />
      </Ariakit.MenuProvider>
    </Ariakit.ComboboxProvider>
  );
}

function StoreMenu() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const menu = Ariakit.useMenuStore({ combobox });
  const value = Ariakit.useStoreState(combobox, "value");
  const deferredValue = useDeferredValue(value);
  const matches = useMemo(() => getMatches(deferredValue), [deferredValue]);

  return (
    <MenuCombobox
      buttonLabel="Store Add block"
      combobox={combobox}
      matches={matches}
      menu={menu}
      searchLabel="Search store blocks"
    />
  );
}

export default function Example() {
  return (
    <main className="min-h-[200vh] space-y-4">
      <ProviderMenu />
      <StoreMenu />
    </main>
  );
}
