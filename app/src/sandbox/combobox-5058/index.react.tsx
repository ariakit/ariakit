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
  const [invalidTarget, setInvalidTarget] = useState("none");

  return (
    <>
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
        <button type="reset">Reset</button>
        <output>
          {submittedValues ? JSON.stringify(submittedValues) : null}
        </output>
      </form>

      <form data-composite-false>
        <Ariakit.ComboboxProvider defaultSelectedValue={["apple"]}>
          <Ariakit.Combobox
            aria-label="Non-composite fruits"
            composite={false}
            name="non-composite-fruits"
          />
        </Ariakit.ComboboxProvider>
      </form>

      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Ariakit.ComboboxProvider defaultSelectedValue={[]}>
          <Ariakit.ComboboxLabel>Required fruits</Ariakit.ComboboxLabel>
          <Ariakit.Combobox
            name="required-fruits"
            required
            onInvalid={(event) => {
              event.preventDefault();
              setInvalidTarget(event.currentTarget.localName);
            }}
          />
        </Ariakit.ComboboxProvider>
        <button type="submit">Validate required fruits</button>
        <p>Invalid target: {invalidTarget}</p>
      </form>
    </>
  );
}
