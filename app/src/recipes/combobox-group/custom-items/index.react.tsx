import {
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemContent,
  ComboboxItemDescription,
  ComboboxItemLabel,
  ComboboxItemSlot,
  ComboboxLabel,
  ComboboxPopover,
  ComboboxProvider,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { matchSorter } from "match-sorter";
import * as React from "react";
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
      <ComboboxProvider inputValue={value} setInputValue={setValue}>
        <ComboboxLabel>Find records</ComboboxLabel>
        <ComboboxInput
          autoSelect
          autoComplete="both"
          placeholder="e.g., John Doe"
          className="w-64"
        />
        <ComboboxPopover>
          {!matches.length && <ComboboxEmpty />}
          {matches.map(([type, items]) => (
            <ComboboxGroup key={type} label={type}>
              {items.map((item) => (
                <ComboboxItem key={item.name} value={item.name}>
                  <ComboboxItemSlot
                    $kind="avatar"
                    $size="md"
                    $rowSpan={2}
                    $layer="brand"
                    $contrast
                    aria-hidden
                  >
                    {getInitials(item.name)}
                  </ComboboxItemSlot>
                  <ComboboxItemContent>
                    <ComboboxItemLabel>{item.name}</ComboboxItemLabel>
                    <ComboboxItemDescription>
                      {"email" in item ? item.email : item.folder}
                    </ComboboxItemDescription>
                  </ComboboxItemContent>
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxPopover>
      </ComboboxProvider>
    </div>
  );
}
