import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import type { MouseEvent } from "react";

function Notes() {
  const [attachments, setAttachments] = useState(0);
  return (
    <>
      <label>
        Note
        <input defaultValue="" />
      </label>
      <Ariakit.Button onClick={() => setAttachments((count) => count + 1)}>
        Add attachment
      </Ariakit.Button>
      <output aria-label="Attachments">Attachments: {attachments}</output>
    </>
  );
}

interface FieldProps {
  combobox?: boolean;
  initiallyNamed?: boolean;
}

function Field({ combobox = false, initiallyNamed = false }: FieldProps) {
  const select = Ariakit.useSelectStore({ defaultValue: "Apple" });
  const comboboxStore = Ariakit.useComboboxStore({
    defaultSelectedValue: "Apple",
  });
  const [included, setIncluded] = useState(initiallyNamed);
  const [submitted, setSubmitted] = useState("Not submitted");
  const label = `${combobox ? "Combobox" : "Select"} ${initiallyNamed ? "named" : "unnamed"}`;
  const name = included ? "fruit" : undefined;
  const selectValue = Ariakit.useStoreState(select, "value");
  const comboboxValue = Ariakit.useStoreState(comboboxStore, "selectedValue");
  const value = combobox ? comboboxValue : selectValue;
  const popupProps = {
    "aria-label": label,
    role: "dialog",
    portal: true,
    modal: false,
    hideOnInteractOutside: false,
    // Portal events still bubble through the trigger in the React tree.
    onClick: (event: MouseEvent) => event.stopPropagation(),
    style: { background: "white", padding: 16, border: "1px solid" },
  };
  return (
    <form
      aria-label={label}
      style={{ margin: 24, display: "flex", gap: 12, alignItems: "center" }}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const fruit = data.get("fruit");
        setSubmitted(typeof fruit === "string" ? fruit : "Omitted");
      }}
    >
      <label>
        <input
          type="checkbox"
          aria-label={`Include ${label}`}
          checked={included}
          onChange={(event) => setIncluded(event.target.checked)}
        />
        Include {label}
      </label>
      {/* TODO: Remove after upgrading to the fixed version.
      https://github.com/ariakit/ariakit/issues/7346 */}
      <input type="hidden" name={name} value={value} />
      {combobox ? (
        <Ariakit.ComboboxProvider store={comboboxStore}>
          <Ariakit.ComboboxSelect aria-label={label}>
            <Ariakit.ComboboxSelectedValue />
            {/* The portal keeps the popup outside the button in the DOM,
            while its React state belongs to the select's rendered subtree. */}
            <Ariakit.ComboboxPopover store={comboboxStore} {...popupProps}>
              <Ariakit.ComboboxList>
                <Ariakit.ComboboxItem value="Apple" />
                <Ariakit.ComboboxItem value="Orange" />
              </Ariakit.ComboboxList>
              <Notes />
            </Ariakit.ComboboxPopover>
          </Ariakit.ComboboxSelect>
        </Ariakit.ComboboxProvider>
      ) : (
        <Ariakit.SelectProvider store={select}>
          <Ariakit.Select aria-label={label}>
            <Ariakit.SelectValue />
            <Ariakit.SelectPopover store={select} {...popupProps}>
              <Ariakit.SelectList>
                <Ariakit.SelectItem value="Apple" />
                <Ariakit.SelectItem value="Orange" />
              </Ariakit.SelectList>
              <Notes />
            </Ariakit.SelectPopover>
          </Ariakit.Select>
        </Ariakit.SelectProvider>
      )}
      <Ariakit.Button type="submit">Submit {label}</Ariakit.Button>
      <output aria-label={`${label} submission`}>{submitted}</output>
    </form>
  );
}

export default function Example() {
  return (
    <div>
      <Field />
      <Field initiallyNamed />
      <Field combobox />
      <Field combobox initiallyNamed />
    </div>
  );
}
