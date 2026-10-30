import * as ak from "@ariakit/react";
import { CheckboxField } from "@ariakit/ui/components/checkbox.ariakit.react";
import { useId, useState } from "react";

const items = [
  { value: "contacts", label: "Contacts" },
  { value: "messages", label: "Messages" },
  { value: "files", label: "Files" },
  { value: "events", label: "Calendar events" },
];

const allValues = items.map((item) => item.value);

export default function Example() {
  const id = useId();
  const [selected, setSelected] = useState(["messages"]);
  const allChecked = selected.length === items.length;
  const getItemId = (value: string) => `${id}-${value}`;
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">Data to export</legend>
      {/* The parent shows the state of its children and lists them in
          aria-controls. A click on a parent in the mixed state checks all of
          them. */}
      <CheckboxField
        checked={allChecked ? true : selected.length ? "mixed" : false}
        aria-controls={allValues.map(getItemId).join(" ")}
        onChange={() => setSelected(allChecked ? [] : allValues)}
      >
        All data
      </CheckboxField>
      {/* The items start where the text of All data starts: after the box and
          the gap of a field without padding. The margin follows the font size
          of each field, like its box and gap. */}
      <ak.CheckboxProvider value={selected} setValue={setSelected}>
        {items.map((item) => (
          <CheckboxField
            key={item.value}
            id={getItemId(item.value)}
            name="data"
            value={item.value}
            className="ms-[1.375em]"
          >
            {item.label}
          </CheckboxField>
        ))}
      </ak.CheckboxProvider>
    </fieldset>
  );
}
