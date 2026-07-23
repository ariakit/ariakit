import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = [
  ["apple", "Apple"],
  ["banana", "Banana"],
  ["orange", "Orange"],
  ["grape", "Grape"],
] as const;

export default function Example() {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [submittedValues, setSubmittedValues] = useState<string[] | null>(null);
  const [reboundTextarea, setReboundTextarea] = useState(false);
  const [controlledHomeTown, setControlledHomeTown] = useState("");
  const [controlledStoreHomeTown, setControlledStoreHomeTown] = useState("");
  const uncontrolledStore = Ariakit.useComboboxStore();
  const controlledStore = Ariakit.useComboboxStore({
    value: controlledStoreHomeTown,
    setValue: setControlledStoreHomeTown,
  });

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
          selectedValue={selectedValues}
          setSelectedValue={setSelectedValues}
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

      <form id="address" aria-label="Address">
        <label>
          Name
          <input name="name" />
        </label>
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>Home town</Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="homeTown" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <Ariakit.ComboboxProvider defaultValue="Boston">
          <Ariakit.ComboboxLabel>Birth place</Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="birthPlace" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>Rebound home town</Ariakit.ComboboxLabel>
          <Ariakit.Combobox
            name="reboundHomeTown"
            render={reboundTextarea ? <textarea /> : <input />}
          />
        </Ariakit.ComboboxProvider>
        <Ariakit.ComboboxProvider store={uncontrolledStore}>
          <Ariakit.ComboboxLabel>Store home town</Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="storeHomeTown" />
        </Ariakit.ComboboxProvider>
        <button type="button" onClick={() => setReboundTextarea(true)}>
          Replace rebound home town
        </button>
        <button type="reset">Reset address</button>
      </form>

      <Ariakit.ComboboxProvider>
        <Ariakit.ComboboxLabel>Former home town</Ariakit.ComboboxLabel>
        <Ariakit.Combobox name="formerHomeTown" form="address" />
        <Ariakit.ComboboxPopover>
          <Ariakit.ComboboxItem value="Boston" />
          <Ariakit.ComboboxItem value="San Diego" />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>

      <form
        aria-label="Canceled address"
        onReset={(event) => event.preventDefault()}
      >
        <label>
          Canceled name
          <input name="canceledName" />
        </label>
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>Canceled home town</Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="canceledHomeTown" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <button type="reset">Cancel address reset</button>
      </form>

      <form aria-label="Controlled address">
        <Ariakit.ComboboxProvider
          value={controlledHomeTown}
          setValue={setControlledHomeTown}
        >
          <Ariakit.ComboboxLabel>Controlled home town</Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="controlledHomeTown" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <Ariakit.ComboboxProvider store={controlledStore}>
          <Ariakit.ComboboxLabel>
            Controlled store home town
          </Ariakit.ComboboxLabel>
          <Ariakit.Combobox name="controlledStoreHomeTown" />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <button type="reset">Reset controlled address</button>
      </form>

      <form aria-label="Inline address">
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>Inline home town</Ariakit.ComboboxLabel>
          <Ariakit.Combobox autoComplete="inline" autoSelect />
          <Ariakit.ComboboxPopover>
            <Ariakit.ComboboxItem value="Boston" />
            <Ariakit.ComboboxItem value="San Diego" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => event.currentTarget.form?.reset()}
        >
          Reset inline address
        </button>
      </form>

      <Ariakit.ComboboxProvider defaultSelectedValue={["apple"]}>
        <Ariakit.Combobox
          aria-label="Non-composite fruits"
          composite={false}
          form="non-composite-form"
          name="non-composite-fruits"
        />
      </Ariakit.ComboboxProvider>

      <form
        id="non-composite-form"
        aria-label="Non-composite fruits"
        data-composite-false
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <button type="submit">Submit non-composite fruits</button>
      </form>

      <form aria-label="Disabled fruits">
        <Ariakit.ComboboxProvider defaultSelectedValue={["apple"]}>
          <Ariakit.Combobox
            aria-disabled
            aria-label="Disabled fruits"
            composite={false}
            name="disabled-fruits"
          />
        </Ariakit.ComboboxProvider>
      </form>

      <Ariakit.ComboboxProvider defaultSelectedValue="apple">
        <Ariakit.Combobox aria-label="Single fruit" name="single-fruit" />
      </Ariakit.ComboboxProvider>
    </>
  );
}
