import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { startTransition, useMemo, useState } from "react";
import list from "./list.ts";
import "./style.css";

export default function Example() {
  const [searchValue, setSearchValue] = useState("");

  const matches = useMemo(() => {
    return matchSorter(list, searchValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [searchValue]);

  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider
        defaultSelectedValue="Apple"
        resetValueOnHide
        setValue={(value) => {
          startTransition(() => {
            setSearchValue(value);
          });
        }}
      >
        <Ariakit.ComboboxSelectLabel>
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect className="button" />
        <Ariakit.ComboboxPopover gutter={4} sameWidth className="popover">
          <div className="combobox-wrapper">
            <Ariakit.ComboboxInput
              autoSelect
              aria-label="Search fruits"
              placeholder="Search..."
              className="combobox"
            />
          </div>
          <Ariakit.ComboboxList>
            {matches.map((value) => (
              <Ariakit.ComboboxItem
                key={value}
                value={value}
                className="select-item"
              />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
