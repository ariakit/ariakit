import {
  Combobox,
  ComboboxItem,
  ComboboxSelect,
} from "@ariakit/ui/components/combobox.ariakit.react";
import { Input } from "@ariakit/ui/components/input.ariakit.react";
import * as React from "react";

export default function Example() {
  const [name, setName] = React.useState("");
  return (
    <section aria-label="Project editor" className="grid gap-8">
      <label>
        Project name
        <Input
          render={undefined}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <p>Project: {name || "Untitled"}</p>
      <label>
        Notes
        <Input render={<textarea />} />
      </label>
      <Combobox
        label="Assignee"
        popover={{ portal: undefined, gutter: undefined }}
      >
        <ComboboxItem
          value="Alice"
          focusOnHover={undefined}
          blurOnHoverEnd={undefined}
        />
        <ComboboxItem
          value="Bob"
          focusOnHover={undefined}
          blurOnHoverEnd={undefined}
        />
      </Combobox>
      <ComboboxSelect
        label="Status"
        defaultValue="Active"
        popover={{ gutter: undefined, shift: undefined }}
        items={[{ value: "Active" }, { value: "Complete" }]}
      />
    </section>
  );
}
