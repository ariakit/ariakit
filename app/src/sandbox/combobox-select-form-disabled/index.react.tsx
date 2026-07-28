import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const accessibleDisabled = true;
  const [renderedDisabled, setRenderedDisabled] = useState(false);
  const [submittedNames, setSubmittedNames] = useState<string[] | null>(null);

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          window.alert(data.get("select"));
        }}
      >
        <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
          <Ariakit.ComboboxSelectLabel>
            Favorite fruit
          </Ariakit.ComboboxSelectLabel>
          <Ariakit.ComboboxSelect
            name="select"
            disabled
            className="pointer-events-none"
          />
          <Ariakit.ComboboxPopover gutter={4} sameWidth unmountOnHide>
            <Ariakit.ComboboxItem value="Apple" />
            <Ariakit.ComboboxItem value="Banana" />
            <Ariakit.ComboboxItem value="Grape" />
            <Ariakit.ComboboxItem value="Orange" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
        <Ariakit.Button type="submit">Submit</Ariakit.Button>
      </form>

      <form
        aria-label="Transformed disabled selects"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmittedNames([...data.keys()]);
        }}
      >
        <Ariakit.SelectProvider defaultValue="Apple">
          <Ariakit.SelectLabel>Select accessible</Ariakit.SelectLabel>
          <Ariakit.Select
            name={accessibleDisabled ? undefined : "select-accessible"}
            disabled={accessibleDisabled}
            accessibleWhenDisabled
          />
        </Ariakit.SelectProvider>

        <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
          <Ariakit.ComboboxSelectLabel>
            Combobox accessible
          </Ariakit.ComboboxSelectLabel>
          <Ariakit.ComboboxSelect
            name={accessibleDisabled ? undefined : "combobox-accessible"}
            disabled={accessibleDisabled}
            accessibleWhenDisabled
          />
        </Ariakit.ComboboxProvider>

        <Ariakit.SelectProvider defaultValue="Apple">
          <Ariakit.SelectLabel>Select rendered</Ariakit.SelectLabel>
          <Ariakit.Select
            name={renderedDisabled ? undefined : "select-rendered"}
            disabled={renderedDisabled}
            render={<div />}
          />
        </Ariakit.SelectProvider>

        <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
          <Ariakit.ComboboxSelectLabel>
            Combobox rendered
          </Ariakit.ComboboxSelectLabel>
          <Ariakit.ComboboxSelect
            name={renderedDisabled ? undefined : "combobox-rendered"}
            disabled={renderedDisabled}
            render={<div />}
          />
        </Ariakit.ComboboxProvider>

        <label>
          <input
            type="checkbox"
            checked={renderedDisabled}
            onChange={(event) => setRenderedDisabled(event.target.checked)}
          />
          Disable rendered selects
        </label>
        <button type="submit">Submit transformed selects</button>
        <output>
          {submittedNames
            ? submittedNames.join(", ") || "No values submitted"
            : "Not submitted"}
        </output>
      </form>
    </>
  );
}
