import * as Ariakit from "@ariakit/react";
import { sync } from "@ariakit/store";
import { useLayoutEffect, useMemo, useState } from "react";

const list = ["Apple", "Banana", "Cherry", "Grape", "Lemon", "Orange"];

// The descendant layout effect runs before ComboboxProvider initializes, so this
// store-level listener exposes reentrant writes during the initial parent push.
function ValueFollowsHighlight() {
  const select = Ariakit.useComboboxContext();

  useLayoutEffect(() => {
    if (!select) return;
    return sync(select, ["activeId"], (state) => {
      if (!state.activeId) return;
      select.setSelectedValue(state.activeId);
    });
  }, [select]);

  return null;
}

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  // The highlighted item should be committed during init so both stores render
  // Banana after the first paint.
  const select = Ariakit.useComboboxStore({
    defaultSelectedValue: "Apple",
    defaultActiveId: "Banana",
    setValue: setSearchValue,
  });
  const value = Ariakit.useStoreState(select, "selectedValue");

  const matches = useMemo(() => {
    const search = searchValue.toLowerCase();
    return list.filter((item) => item.toLowerCase().includes(search));
  }, [searchValue]);

  return (
    <>
      <Ariakit.ComboboxProvider store={select}>
        <ValueFollowsHighlight />
        <Ariakit.ComboboxSelectLabel>
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover gutter={4} sameWidth>
          <Ariakit.ComboboxInput placeholder="Search..." />
          <Ariakit.ComboboxList>
            {matches.map((item) => (
              <Ariakit.ComboboxItem key={item} id={item} value={item} />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <p>
        Committed value: <output>{value}</output>
      </p>
    </>
  );
}
