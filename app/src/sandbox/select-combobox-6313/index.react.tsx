import * as Ariakit from "@ariakit/react";
import { sync } from "@ariakit/store";
import { useLayoutEffect, useMemo, useState } from "react";

const list = ["Apple", "Banana", "Cherry", "Grape", "Lemon", "Orange"];

// The descendant layout effect runs before SelectProvider initializes, so this
// store-level listener exposes reentrant writes during the initial parent push.
function ValueFollowsHighlight() {
  const select = Ariakit.useSelectContext();

  useLayoutEffect(() => {
    if (!select) return;
    return sync(select, ["activeId"], (state) => {
      if (!state.activeId) return;
      const { activeId } = state;
      // TODO: Remove this workaround when
      // https://github.com/ariakit/ariakit/issues/6313 is fixed.
      queueMicrotask(() => select.setValue(activeId));
    });
  }, [select]);

  return null;
}

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  // The highlighted item should be committed during init so both stores render
  // Banana after the first paint.
  const select = Ariakit.useSelectStore({
    defaultValue: "Apple",
    defaultActiveId: "Banana",
  });
  const value = Ariakit.useStoreState(select, "value");

  const matches = useMemo(() => {
    const search = searchValue.toLowerCase();
    return list.filter((item) => item.toLowerCase().includes(search));
  }, [searchValue]);

  return (
    <>
      <Ariakit.ComboboxProvider setValue={setSearchValue}>
        <Ariakit.SelectProvider store={select}>
          <ValueFollowsHighlight />
          <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
          <Ariakit.Select />
          <Ariakit.SelectPopover gutter={4} sameWidth>
            <Ariakit.Combobox placeholder="Search..." />
            <Ariakit.ComboboxList>
              {matches.map((item) => (
                <Ariakit.SelectItem
                  key={item}
                  id={item}
                  value={item}
                  render={<Ariakit.ComboboxItem />}
                />
              ))}
            </Ariakit.ComboboxList>
          </Ariakit.SelectPopover>
        </Ariakit.SelectProvider>
      </Ariakit.ComboboxProvider>
      <p>
        Committed value: <output>{value}</output>
      </p>
    </>
  );
}
