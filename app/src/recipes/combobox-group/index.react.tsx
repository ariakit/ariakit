import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { matchSorter } from "match-sorter";
import * as React from "react";
import data from "./data.ts";

export default function Example() {
  const [value, setValue] = React.useState("");
  const deferredValue = React.useDeferredValue(value);

  const matches = React.useMemo(() => {
    const keys = ["name", "email", "folder"];
    const items = matchSorter(data, deferredValue, {
      keys,
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
    return Object.entries(
      Object.groupBy(items, (item) => {
        if ("folder" in item) return "Files";
        return "Members";
      }),
    );
  }, [deferredValue]);

  return (
    <div className="flex flex-col gap-2">
      <Combobox
        label="Find records"
        autoSelect
        autoComplete="both"
        placeholder="e.g., John Doe"
        inputValue={value}
        setInputValue={setValue}
        className="w-64"
      >
        {!matches.length && <ComboboxEmpty />}
        {matches.map(([type, items]) => (
          <ComboboxGroup key={type} label={type}>
            {items.map((item) => (
              <ComboboxItem key={item.name} value={item.name} />
            ))}
          </ComboboxGroup>
        ))}
      </Combobox>
    </div>
  );
}
