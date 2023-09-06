import "./style.css";
import { startTransition, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { ComboboxProvider } from "@ariakit/react-core/combobox/combobox-provider";
import { SelectProvider } from "@ariakit/react-core/select/select-provider";
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
    <div className="wrapper">
      <ComboboxProvider
        resetValueOnHide
        setValue={(value) => {
          startTransition(() => {
            setSearchValue(value);
          });
        }}
      >
        <SelectProvider defaultValue="Apple">
          <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
          <Ariakit.Select className="button" />
          <Ariakit.SelectPopover gutter={4} sameWidth className="popover">
            <div className="combobox-wrapper">
              <Ariakit.Combobox
                autoSelect
                placeholder="Search..."
                className="combobox"
              />
            </div>
            <Ariakit.ComboboxList>
              {matches.map((value) => (
                <Ariakit.SelectItem
                  key={value}
                  value={value}
                  className="select-item"
                  render={<Ariakit.ComboboxItem />}
                />
              ))}
            </Ariakit.ComboboxList>
          </Ariakit.SelectPopover>
        </SelectProvider>
      </ComboboxProvider>
    </div>
  );
}
