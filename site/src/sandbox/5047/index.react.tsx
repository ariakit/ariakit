import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { startTransition, useMemo, useState } from "react";

const list = [
  "Apple",
  "Banana",
  "Cherry",
  "Grape",
  "Lemon",
  "Orange",
  "Pasta",
  "Pizza",
];

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  // TODO: Remove when https://github.com/ariakit/ariakit/issues/5047 is fixed
  const [canAutoFocus, setCanAutoFocus] = useState(true);

  const matches = useMemo(() => {
    return matchSorter(list, searchValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [searchValue]);

  return (
    <Ariakit.ComboboxProvider
      resetValueOnHide
      setValue={(value) => {
        // TODO: Remove when https://github.com/ariakit/ariakit/issues/5047 is fixed
        setCanAutoFocus(false);
        startTransition(() => {
          setSearchValue(value);
        });
      }}
      setOpen={(open) => {
        if (!open) {
          // TODO: Remove when https://github.com/ariakit/ariakit/issues/5047 is fixed
          setCanAutoFocus(true);
        }
      }}
    >
      <Ariakit.SelectProvider defaultValue="Apple">
        <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover gutter={4} sameWidth>
          <Ariakit.Combobox autoSelect placeholder="Search..." />
          <Ariakit.ComboboxList>
            {matches.map((value) => (
              <Ariakit.SelectItem
                key={value}
                value={value}
                // TODO: Remove when https://github.com/ariakit/ariakit/issues/5047 is fixed
                autoFocus={canAutoFocus ? undefined : false}
                render={<Ariakit.ComboboxItem />}
              />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  );
}
