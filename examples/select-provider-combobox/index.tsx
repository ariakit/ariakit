import "./style.css";
import { useDeferredValue, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { ComboboxProvider } from "@ariakit/react-core/combobox/combobox-provider";
import { SelectProvider } from "@ariakit/react-core/select/select-provider";
import { matchSorter } from "match-sorter";
import list from "./list.js";

export default function Example() {
  const combobox = Ariakit.useComboboxStore();
  const value = combobox.useState("value");
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(() => {
    return matchSorter(list, deferredValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [deferredValue]);

  return (
    <div className="wrapper">
      <ComboboxProvider store={combobox} resetValueOnHide>
        <SelectProvider combobox={combobox} defaultValue="Apple">
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
