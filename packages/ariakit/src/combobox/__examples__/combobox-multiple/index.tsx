import { useId, useState } from "react";
import { ComboboxMultiple, ComboboxMultipleItem } from "./combobox-multiple";
import list from "./list";
import "./style.css";

export default function Example() {
  const id = useId();
  const [values, setValues] = useState<string[]>(["Bacon"]);
  const [matches, setMatches] = useState<string[]>([]);
  return (
    <div className="wrapper">
      <label htmlFor={id}>Your favorite food</label>
      <ComboboxMultiple
        id={id}
        defaultList={list}
        onFilter={setMatches}
        values={values}
        onValuesChange={setValues}
        placeholder="e.g., Apple, Burger"
      >
        {matches.length ? (
          matches.map((value) => (
            <ComboboxMultipleItem key={value} value={value} />
          ))
        ) : (
          <div>No results found</div>
        )}
      </ComboboxMultiple>
    </div>
  );
}
