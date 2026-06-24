import * as Ariakit from "@ariakit/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

const fruits = ["Apple", "Banana", "Cherry", "Grape", "Orange"];

// TODO: Remove this workaround after
// https://github.com/ariakit/ariakit/issues/6298 is fixed.
function getHighlightedParts(itemValue: string, userValue: string) {
  const parts: ReactNode[] = [];
  const normalizedItem = itemValue.toLowerCase();
  const normalizedUser = userValue.toLowerCase();
  if (!normalizedUser) return itemValue;

  const ranges: Array<[number, number]> = [];
  let index = normalizedItem.indexOf(normalizedUser);

  while (index !== -1) {
    const end = index + normalizedUser.length;
    const lastRange = ranges[ranges.length - 1];
    if (lastRange && index < lastRange[1]) {
      lastRange[1] = Math.max(lastRange[1], end);
    } else {
      ranges.push([index, end]);
    }
    index = normalizedItem.indexOf(normalizedUser, index + 1);
  }

  let position = 0;
  for (const [start, end] of ranges) {
    if (start > position) {
      parts.push(
        <span key={parts.length} data-autocomplete-value="">
          {itemValue.slice(position, start)}
        </span>,
      );
    }
    parts.push(
      <span key={parts.length} data-user-value="">
        {itemValue.slice(start, end)}
      </span>,
    );
    position = end;
  }

  if (position < itemValue.length) {
    parts.push(
      <span key={parts.length} data-autocomplete-value="">
        {itemValue.slice(position)}
      </span>,
    );
  }

  return parts;
}

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
            <Ariakit.ComboboxItemValue>
              {getHighlightedParts(fruit, searchValue)}
            </Ariakit.ComboboxItemValue>
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
