import "./style.css";
import { useDeferredValue, useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import list from "../combobox-multiple/list.js";
import { Combobox, ComboboxItem } from "./combobox-multiple.jsx";

export default function Example() {
  const [value, setValue] = useState("");
  const [values, setValues] = useState<string[]>(["Bacon"]);
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () => matchSorter(list, deferredValue),
    [deferredValue],
  );

  return (
    <div className="wrapper">
      <Combobox
        label="Your favorite food"
        placeholder="e.g., Apple, Burger"
        value={value}
        onChange={setValue}
        values={values}
        onValuesChange={setValues}
      >
        {matches.map((value, i) => (
          <ComboboxItem key={value + i} value={value} />
        ))}
        {!matches.length && <div className="no-results">No results found</div>}
      </Combobox>
    </div>
  );
}
