import { useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import { ComboboxMultiple, ComboboxMultipleItem } from "./combobox-multiple.js";
import list from "./list.js";
import "./style.css";

export default function Example() {
  const [value, setValue] = useState("");
  const [values, setValues] = useState<string[]>(["Bacon"]);

  const matches = useMemo(() => matchSorter(list, value), [value]);

  return (
    <div className="wrapper">
      <ComboboxMultiple
        label="Your favorite food"
        placeholder="e.g., Apple, Burger"
        value={value}
        onChange={setValue}
        values={values}
        onValuesChange={setValues}
      >
        {matches.length ? (
          matches.map((value) => (
            <ComboboxMultipleItem key={value} value={value} />
          ))
        ) : (
          <div className="no-results">No results found</div>
        )}
      </ComboboxMultiple>
    </div>
  );
}
