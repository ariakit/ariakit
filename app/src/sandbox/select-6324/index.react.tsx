import * as Ariakit from "@ariakit/react";

const fruits = ["Apple", "Banana", "Orange"];

// The select button owns virtual focus, so it keeps DOM focus while the active
// item changes.
export default function Example() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
      <Ariakit.ComboboxSelectLabel>Fruit</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxPopover
        gutter={4}
        sameWidth
        style={{ background: "white", border: "1px solid gray" }}
      >
        <Ariakit.ComboboxList>
          {fruits.map((fruit) => (
            <Ariakit.ComboboxItem
              key={fruit}
              value={fruit}
              style={{ display: "block", padding: "4px 8px" }}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
