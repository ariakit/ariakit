import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { startTransition, useMemo, useState } from "react";

const list = ["Apple", "Banana", "Cherry", "Grape", "Lemon", "Orange"];

export default function Example() {
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    return matchSorter(list, searchValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [searchValue]);

  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Apple"
      virtualFocus={false}
      resetValueOnHide
      setValue={(value) => {
        startTransition(() => {
          setSearchValue(value);
        });
      }}
    >
      <Ariakit.ComboboxSelectLabel>Favorite fruit</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4} sameWidth>
        <Ariakit.ComboboxInput
          autoSelect
          aria-label="Search fruits"
          placeholder="Search..."
        />
        <Ariakit.ComboboxList>
          {matches.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
