import * as Ariakit from "@ariakit/react";
import { sync } from "@ariakit/store";
import { useLayoutEffect, useMemo, useState } from "react";

const list = ["Apple", "Banana", "Cherry", "Grape", "Lemon", "Orange"];

// The descendant layout effect runs before ComboboxProvider initializes, so this
// store-level listener exposes reentrant writes during the initial parent push.
function ValueFollowsHighlight() {
  const combobox = Ariakit.useComboboxContext();

  useLayoutEffect(() => {
    if (!combobox) return;
    return sync(combobox, ["activeId"], (state) => {
      if (!state.activeId) return;
      combobox.setSelectedValue(state.activeId);
    });
  }, [combobox]);

  return null;
}

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  // The highlighted item should be committed during init so both stores render
  // Banana after the first paint.
  const combobox = Ariakit.useComboboxStore({
    defaultSelectedValue: "Apple",
    defaultActiveId: "Banana",
    setValue: setSearchValue,
  });
  const value = Ariakit.useStoreState(combobox, "selectedValue");

  const matches = useMemo(() => {
    const search = searchValue.toLowerCase();
    return list.filter((item) => item.toLowerCase().includes(search));
  }, [searchValue]);

  return (
    <>
      <Ariakit.ComboboxProvider store={combobox}>
        <ValueFollowsHighlight />
        <Ariakit.ComboboxSelectLabel>
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover gutter={4} sameWidth>
          <Ariakit.ComboboxInput
            aria-label="Search fruits"
            placeholder="Search..."
          />
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
