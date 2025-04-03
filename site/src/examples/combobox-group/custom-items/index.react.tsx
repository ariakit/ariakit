import { matchSorter } from "match-sorter";
import * as React from "react";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
} from "../combobox.react.tsx";
import data from "../data.ts";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export default function Example() {
  const [value, setValue] = React.useState("");
  const deferredValue = React.useDeferredValue(value);

  const matches = React.useMemo(() => {
    const keys = ["name", "filename", "email", "folder"];
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
    <label className="flex flex-col gap-2 indent-2">
      Find records
      <Combobox
        autoSelect
        autoComplete="both"
        placeholder="e.g., John Doe"
        value={value}
        onChange={setValue}
      >
        {!matches.length && <ComboboxEmpty />}
        {matches.map(([type, items]) => (
          <ComboboxGroup key={type} label={type}>
            {items.map((item) => (
              <ComboboxItem key={item.name} value={item.name}>
                <div className="grid grid-cols-[2rem_auto] items-center gap-2">
                  <div className="ak-layer-contrast-primary rounded-full aspect-square flex items-center justify-center text-sm font-medium">
                    {getInitials(item.name)}
                  </div>
                  <div className="grid">
                    <div className="ak-text/90 text-sm font-medium">
                      {item.name}
                    </div>
                    <div className="ak-text/60 text-xs">
                      {"email" in item ? item.email : item.folder}
                    </div>
                  </div>
                </div>
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        ))}
      </Combobox>
    </label>
  );
}
