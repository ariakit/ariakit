import "./style.css";
import { useMemo, useState, useTransition } from "react";
import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import list from "./list.js";

export default function Example() {
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState("");
  const [values, setValues] = useState(["Bacon"]);
  const matches = useMemo(() => matchSorter(list, searchValue), [searchValue]);

  return (
    <Ariakit.ComboboxProvider
      selectedValue={values}
      setSelectedValue={setValues}
      setValue={(value) => {
        startTransition(() => {
          setSearchValue(value);
        });
      }}
    >
      <label className="label">
        Your favorite food
        <Ariakit.Combobox
          placeholder="e.g., Apple, Burger"
          className="combobox"
        />
      </label>
      <Ariakit.ComboboxPopover
        sameWidth
        gutter={8}
        className="popover"
        aria-busy={isPending}
      >
        {matches.map((value) => (
          <Ariakit.ComboboxItem
            key={value}
            value={value}
            focusOnHover
            className="combobox-item"
          >
            <Ariakit.ComboboxItemCheck />
            {value}
          </Ariakit.ComboboxItem>
        ))}
        {!matches.length && <div className="no-results">No results found</div>}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
