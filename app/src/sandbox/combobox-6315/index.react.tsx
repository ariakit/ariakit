import * as Ariakit from "@ariakit/react";
import { useMemo, useState } from "react";

const drinks = ["Cafeteria", "Café au lait", "Caramel latte", "Chai tea"];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const matches = useMemo(() => {
    const search = normalize(searchValue);
    return drinks.filter((drink) => normalize(drink).startsWith(search));
  }, [searchValue]);

  return (
    <>
      <Ariakit.ComboboxProvider setValue={setSearchValue}>
        <p>
          Decomposed sample: <b>{"cafe\u0301"}</b>
        </p>
        <Ariakit.ComboboxLabel>Your favorite drink</Ariakit.ComboboxLabel>
        <Ariakit.Combobox
          placeholder="e.g., Caramel latte"
          autoSelect
          autoComplete="both"
          onChange={(event) => {
            // TODO: Remove this workaround when
            // https://github.com/ariakit/ariakit/issues/6315 is fixed.
            const input = event.currentTarget;
            const nfcValue = input.value.normalize("NFC");
            if (nfcValue !== input.value) {
              input.value = nfcValue;
            }
          }}
        />
        <Ariakit.ComboboxPopover gutter={8} sameWidth>
          {matches.map((drink) => (
            <Ariakit.ComboboxItem key={drink} value={drink} />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <button type="button">Save</button>
      <output>{searchValue}</output>
    </>
  );
}
