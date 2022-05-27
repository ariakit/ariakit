import { useState } from "react";
import { ComboboxMultiple, ComboboxMultipleItem } from "./combobox-multiple";
import list from "./list";
import "./style.css";

export default function Example() {
  const [values, setValues] = useState<string[]>(["Bacon"]);
  const [matches, setMatches] = useState<string[]>([]);
  return (
    <div>
      <ComboboxMultiple
        label="Your favorite food"
        placeholder="e.g., Apple, Burger"
        defaultList={list}
        onFilter={setMatches}
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
