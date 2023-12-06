import "./style.css";
import { useDeferredValue, useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import list from "../combobox-multiple/list.js";
import { Combobox, ComboboxItem } from "./combobox-multiple.js";

export default function Example() {
  const [value, setValue] = useState("");
  const [values, setValues] = useState<string[]>(["Bacon"]);
  const deferredValue = useDeferredValue(value);

  const matches = useMemo(
    () => matchSorter(list, deferredValue),
    [deferredValue],
  );

  return (
    <Combobox
      label="Your favorite food"
      placeholder="e.g., Apple, Burger"
      value={value}
      onChange={setValue}
      values={values}
      onValuesChange={setValues}
    >
      {matches.map((value) => (
        <ComboboxItem key={value} value={value} />
      ))}
      {!matches.length && <div className="no-results">No results found</div>}
    </Combobox>
  );
}
