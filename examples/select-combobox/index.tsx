import "./style.css";
import { useCallback, useDeferredValue, useEffect, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { CollectionRenderer } from "@ariakit/react-core/collection/collection-renderer";
import { matchSorter } from "match-sorter";
import list from "./list.js";

const emptyArr = [] as never[];

const defaultItems = list.map((value) => ({
  id: "id-" + value,
  value,
  children: value,
}));

export default function Example() {
  const combobox = Ariakit.useComboboxStore({
    resetValueOnHide: true,
    defaultItems,
  });
  const select = Ariakit.useSelectStore({
    combobox,
    defaultItems,
    defaultValue: "Apple",
  });

  const mounted = combobox.useState("mounted");
  const value = combobox.useState("value");
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(() => {
    if (!mounted) return emptyArr;
    return matchSorter(defaultItems, deferredValue, {
      keys: ["value"],
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [mounted, deferredValue]);

  const selectValue = select.useState("value");
  const activeId = select.useState("activeId");
  const valueId = !mounted
    ? undefined
    : defaultItems.find((item) => item.value === selectValue)?.id;
  const activeIndex = !mounted
    ? undefined
    : defaultItems.findIndex((item) => item.id === activeId);

  const visibleIds = useMemo(() => {
    if (!mounted) return emptyArr;
    return [
      defaultItems.at(0)?.id,
      activeIndex != null && defaultItems.at(activeIndex - 1)?.id,
      activeId,
      activeIndex != null && defaultItems.at(activeIndex + 1)?.id,
      valueId,
      defaultItems.at(-1)?.id,
    ].filter((value): value is string => value != null);
  }, [mounted, valueId, activeIndex]);

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
          <Ariakit.Collection store={combobox}>
            <CollectionRenderer
              items={matches}
              visibleIds={visibleIds}
              itemSize={40}
            >
              {({ value, ...item }) => (
                <Ariakit.ComboboxItem
                  {...item}
                  key={item.id}
                  focusOnHover
                  className="select-item"
                  render={<Ariakit.SelectItem value={value} />}
                />
              )}
            </CollectionRenderer>
          </Ariakit.Collection>
        </Ariakit.ComboboxList>
      </Ariakit.SelectPopover>
    </div>
  );
}
