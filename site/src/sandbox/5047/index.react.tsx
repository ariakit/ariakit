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
      resetValueOnHide
      setValue={(value) => {
        startTransition(() => {
          setSearchValue(value);
        });
      }}
    >
      <Ariakit.SelectProvider virtualFocus={false} defaultValue="Apple">
        <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover gutter={4} sameWidth>
          <Ariakit.Combobox autoSelect placeholder="Search..." />
          <Ariakit.ComboboxList>
            {matches.map((value) => (
              <Ariakit.SelectItem
                key={value}
                value={value}
                render={<Ariakit.ComboboxItem />}
              />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  );
}
