import { matchSorter } from "match-sorter";
import { useDeferredValue, useMemo, useState } from "react";
import list from "../combobox-multiple/list.ts";
import { Combobox, ComboboxItem } from "./combobox-multiple.tsx";
import "./style.css";

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
