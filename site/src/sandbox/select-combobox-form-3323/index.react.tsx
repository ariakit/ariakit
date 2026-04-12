import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { startTransition, useMemo, useState } from "react";

const list = ["Apple", "Banana", "Cherry", "Grape", "Lemon", "Orange"];

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const matches = useMemo(() => {
    return matchSorter(list, searchValue, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [searchValue]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Ariakit.ComboboxProvider
        resetValueOnHide
        setValue={(value) => {
          startTransition(() => {
            setSearchValue(value);
          });
        }}
      >
        <Ariakit.SelectProvider defaultValue="Apple">
          <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
          <Ariakit.Select />
          <Ariakit.SelectPopover gutter={4} sameWidth>
            <Ariakit.Combobox
              autoSelect
              placeholder="Search..."
              // TODO: Remove this workaround when the fix lands.
              // https://github.com/ariakit/ariakit/issues/3323
              onKeyDown={(event) => {
                if (event.key === "Enter" && !matches.length) {
                  event.preventDefault();
                }
              }}
            />
            <Ariakit.ComboboxList>
              {matches.map((value) => (
                <Ariakit.SelectItem
                  key={value}
                  value={value}
                  render={<Ariakit.ComboboxItem />}
                />
              ))}
            </Ariakit.ComboboxList>
          </Ariakit.SelectPopover>
        </Ariakit.SelectProvider>
      </Ariakit.ComboboxProvider>
      {submitted && <div>Form submitted</div>}
    </form>
  );
}
