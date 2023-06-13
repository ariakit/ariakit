import "./style.css";
import { useDeferredValue, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { CompositeItems } from "@ariakit/react-core/composite/composite-items";
import { matchSorter } from "match-sorter";
import list from "./list.js";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const select = Ariakit.useSelectStore({ combobox, defaultValue: "Apple" });

  const mounted = select.useState("mounted");
  const value = combobox.useState("value");
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(() => {
    if (!mounted) return [];
    return matchSorter(list, deferredValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [mounted, deferredValue]);

  return (
    <div className="wrapper">
      <Ariakit.SelectLabel store={select}>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} className="select" />
      <Ariakit.SelectPopover
        store={select}
        gutter={4}
        sameWidth
        className="popover"
      >
        <div className="combobox-wrapper z-10">
          <Ariakit.Combobox
            store={combobox}
            autoSelect
            placeholder="Search..."
            className="combobox"
          />
        </div>
        <Ariakit.ComboboxList store={combobox}>
          <CompositeItems itemSize={40} items={matches.length ? 10000 : 0}>
            {(item, index) => (
              <Ariakit.ComboboxItem
                {...item}
                key={index}
                focusOnHover
                className="select-item w-full"
                render={(p) => (
                  <Ariakit.SelectItem {...p} value={`Item ${index}`} />
                )}
              />
            )}
          </CompositeItems>
        </Ariakit.ComboboxList>
      </Ariakit.SelectPopover>
    </div>
  );
}
