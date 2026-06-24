import * as Ariakit from "@ariakit/react";
import { useMemo, useState } from "react";

const fruits = ["Apple", "Banana", "Cherry", "Grape", "Orange"];

// Reproduces https://github.com/ariakit/ariakit/issues/6298
export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const matches = useMemo(() => {
    const search = searchValue.toLowerCase();
    return fruits.filter((fruit) => fruit.toLowerCase().includes(search));
  }, [searchValue]);

  return (
    <Ariakit.ComboboxProvider defaultOpen setValue={setSearchValue}>
      <Ariakit.ComboboxLabel>Your favorite fruit</Ariakit.ComboboxLabel>
      <Ariakit.Combobox placeholder="e.g., Apple" />
      <Ariakit.ComboboxPopover gutter={8} sameWidth>
        {matches.map((fruit) => (
          <Ariakit.ComboboxItem key={fruit} value={fruit}>
            <Ariakit.ComboboxItemValue />
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
