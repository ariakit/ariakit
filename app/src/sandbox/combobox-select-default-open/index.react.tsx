import * as Ariakit from "@ariakit/react";
import { vegetables } from "./vegetables.ts";

export default function Example() {
  return (
    <Ariakit.ComboboxProvider defaultOpen defaultSelectedValue="Onion">
      <Ariakit.ComboboxSelectLabel>Vegetable</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover
        gutter={4}
        sameWidth
        style={{ background: "white", border: "1px solid gray" }}
      >
        {/* The list owns the scrollport so it is both the listbox and the
        element the opening presentation scrolls. */}
        <Ariakit.ComboboxList style={{ maxHeight: 120, overflow: "auto" }}>
          {vegetables.map((value) => (
            <Ariakit.ComboboxItem
              key={value}
              value={value}
              style={{ display: "block", padding: "4px 8px" }}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
