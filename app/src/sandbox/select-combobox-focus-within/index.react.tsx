import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const foods = [
  "Apple",
  "Bacon",
  "Banana",
  "Broccoli",
  "Burger",
  "Cake",
  "Chocolate",
] as const;

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const select = Ariakit.useSelectStore({
    combobox,
    defaultValue: "Apple",
  });
  const [popoverFocused, setPopoverFocused] = useState(false);
  const searchValue = Ariakit.useStoreState(combobox, "value");
  const matches = foods.filter((value) =>
    value.toLowerCase().includes(searchValue.toLowerCase()),
  );
  const showCancel = popoverFocused || searchValue !== "";
  return (
    <>
      <div role="group" className={popoverFocused ? "focus-within" : undefined}>
        <Ariakit.SelectLabel store={select}>Favorite fruit</Ariakit.SelectLabel>
        <Ariakit.Select store={select} />
        <Ariakit.SelectPopover
          store={select}
          portal
          gutter={4}
          sameWidth
          onFocus={() => setPopoverFocused(true)}
          onBlur={() => setPopoverFocused(false)}
        >
          <Ariakit.Combobox
            store={combobox}
            autoSelect
            placeholder="Search foods"
          />
          <Ariakit.ComboboxCancel
            store={combobox}
            data-visible={showCancel ? "" : undefined}
          />
          <Ariakit.ComboboxList store={combobox}>
            {matches.map((value) => (
              <Ariakit.ComboboxItem
                key={value}
                focusOnHover
                render={<Ariakit.SelectItem store={select} value={value} />}
              />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </div>
      <button type="button">External button</button>
    </>
  );
}
