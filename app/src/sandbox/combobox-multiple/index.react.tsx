import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { useMemo, useState, useTransition } from "react";
import list from "./list.ts";

export default function Example() {
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState("");
  const [selectedValues, setSelectedValues] = useState(["Bacon"]);

  const matches = useMemo(() => matchSorter(list, searchValue), [searchValue]);

  return (
    <Ariakit.ComboboxProvider
      selectedValue={selectedValues}
      setSelectedValue={setSelectedValues}
      setValue={(value) => {
        startTransition(() => {
          setSearchValue(value);
        });
      }}
    >
      <Ariakit.ComboboxLabel className="label">
        Your favorite food
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox
        placeholder="e.g., Apple, Burger"
        className="combobox"
      />
      <Ariakit.ComboboxPopover
        sameWidth
        gutter={8}
        className="relative z-50 flex max-h-[min(var(--popover-available-height,300px),300px)] flex-col overflow-auto overscroll-contain rounded-lg border border-solid border-gray-250 bg-white p-2 text-black shadow-lg outline-none aria-busy:[--item-opacity:0.5] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:shadow-lg-dark"
        aria-busy={isPending}
      >
        {matches.map((value) => (
          <Ariakit.ComboboxItem
            key={value}
            value={value}
            focusOnHover
            className="flex cursor-default scroll-m-2 items-center gap-2 rounded p-2 opacity-[var(--item-opacity,1)] outline-none transition-opacity hover:bg-blue-200/40 data-[active-item]:bg-blue-600 data-[active-item]:text-white dark:hover:bg-blue-600/25 dark:data-[active-item]:bg-blue-600"
          >
            <Ariakit.ComboboxItemCheck />
            {value}
          </Ariakit.ComboboxItem>
        ))}
        {!matches.length && <div className="no-results">No results found</div>}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
