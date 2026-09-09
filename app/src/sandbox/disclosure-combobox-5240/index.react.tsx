import {
  Combobox,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSelect,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { Disclosure } from "@ariakit/ui/components/disclosure.ariakit.react";
import * as React from "react";

export default function Example() {
  const [headings, setHeadings] = React.useState(false);
  return (
    <div className="grid gap-4">
      <label>
        <input
          type="checkbox"
          checked={headings}
          onChange={(event) => setHeadings(event.target.checked)}
        />
        Show filter headings
      </label>
      <Disclosure button={headings && "Project filters"}>
        <div className="grid gap-4">
          <Combobox label={headings && "Assignee"} aria-label="Assignee">
            <ComboboxGroup label={headings && "Team"}>
              <ComboboxItem value="Alice" />
              <ComboboxItem value="Bob" />
            </ComboboxGroup>
          </Combobox>
          <ComboboxSelect
            label={headings && "Status"}
            aria-label="Status"
            defaultValue="Active"
            items={[{ value: "Active" }, { value: "Complete" }]}
          />
        </div>
      </Disclosure>
      <Disclosure button={0}>No pending requests</Disclosure>
    </div>
  );
}
