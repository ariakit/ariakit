import { ComboboxItemValue } from "@ariakit/react";
import { useState } from "react";
import list from "./list.ts";
import { SelectCombobox, SelectComboboxItem } from "./select-combobox.tsx";
import "./style.css";

export default function Example() {
  const [wrapperFocused, setWrapperFocused] = useState(false);
  const [matches, setMatches] = useState(list);

  const onSearch = (value: string) => {
    setMatches(
      list.filter((item) => item.toLowerCase().includes(value.toLowerCase())),
    );
  };

  return (
    <div
      role="group"
      className={wrapperFocused ? "wrapper focus-within" : "wrapper"}
      onFocus={() => setWrapperFocused(true)}
      onBlur={() => setWrapperFocused(false)}
    >
      <SelectCombobox
        label="Favorite fruit"
        onSearch={onSearch}
        defaultValue="Cookie"
        searchPlaceholder="Search..."
      >
        {matches.map((value) => (
          <SelectComboboxItem key={value} value={value}>
            <ComboboxItemValue value={value} />
          </SelectComboboxItem>
        ))}
      </SelectCombobox>
    </div>
  );
}
