import "./style.css";
import { useDeferredValue, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { CompositeRenderer } from "@ariakit/react-core/composite/composite-renderer";
import { kebabCase } from "lodash-es";
import { matchSorter } from "match-sorter";
import list from "./list.js";

const emptyArr = [] as never[];

const defaultItems = list.map((value) => ({
  id: kebabCase(value),
  value,
  children: value,
  disabled: false,
}));

export default function Example() {
  const combobox = Ariakit.useComboboxStore({
    defaultItems,
    resetValueOnHide: true,
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

  const valueIndex = select.useState((state) => {
    if (!mounted) return;
    return matches.findIndex((item) => item.value === state.value);
  });

  const persistentIndices = useMemo(() => {
    if (!mounted) return emptyArr;
    return [valueIndex].filter((value): value is number => value != null);
  }, [mounted, valueIndex]);

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
            <CompositeRenderer
              items={matches}
              itemSize={40}
              persistentIndices={persistentIndices}
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
            </CompositeRenderer>
          </Ariakit.Collection>
        </Ariakit.ComboboxList>
      </Ariakit.SelectPopover>
    </div>
  );
}
