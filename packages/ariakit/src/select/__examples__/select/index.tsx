import { useState } from "react";
import list from "./list";
import { SelectCombobox, SelectComboboxItem } from "./select-combobox";
import "./style.css";

export default function Example() {
  const [matches, setMatches] = useState<string[]>([]);
  return (
    <div className="wrapper">
      <SelectCombobox
        label="Your favorite food"
        defaultValue="Orange"
        defaultList={list}
        onFilter={setMatches}
      >
        {matches.map((value) => (
          <SelectComboboxItem
            key={value}
            value={value}
            className="select-item"
          />
        ))}
      </SelectCombobox>
    </div>
  );
}
