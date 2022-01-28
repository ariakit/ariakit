import { useState } from "react";
import list from "./list";
import { SelectCombobox, SelectComboboxItem } from "./select-combobox";
import "./style.css";

export default function Example() {
  const [matches, setMatches] = useState<string[]>([]);
  return (
    <div className="wrapper">
      <form>
        <select>
          <option value="Apple">Apple</option>
          <option value="Orange">Orange</option>
          <option value="Banana">Banana</option>
        </select>
        <input type="text" name="test" />
        <SelectCombobox
          label="Your favorite food"
          defaultValue="Orange"
          defaultList={list}
          onFilter={setMatches}
          name="favorite-fruit"
        >
          {matches.map((value) => (
            <SelectComboboxItem
              key={value}
              value={value}
              className="select-item"
              disabled={value === "Grape"}
            />
          ))}
        </SelectCombobox>
        <input type="password" name="password" />
      </form>
    </div>
  );
}
