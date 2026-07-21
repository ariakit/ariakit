import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = [
  ["apple", "Apple"],
  ["banana", "Banana"],
  ["orange", "Orange"],
  ["grape", "Grape"],
] as const;

export default function Example() {
  const [submittedValues, setSubmittedValues] = useState<string[] | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setSubmittedValues(formData.getAll("fruits").map(String));
      }}
    >
      <Ariakit.ComboboxProvider
        defaultSelectedValue={[]}
        resetValueOnHide={false}
      >
        <Ariakit.ComboboxLabel>Favorite fruits</Ariakit.ComboboxLabel>
        <Ariakit.Combobox name="fruits" />
        <Ariakit.ComboboxPopover>
          {fruits.map(([value, label]) => (
            <Ariakit.ComboboxItem key={value} value={value}>
              {label}
            </Ariakit.ComboboxItem>
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <button type="submit">Submit</button>
      <output>
        {submittedValues ? JSON.stringify(submittedValues) : null}
      </output>
    </form>
  );
}
