import * as Ariakit from "@ariakit/react";

const fruits = ["Apple", "Banana", "Orange"];

// virtualFocus is disabled so items receive real DOM focus, making the
// focusOnMove behavior observable through document.activeElement.
export default function Example() {
  return (
    <Ariakit.SelectProvider defaultValue="Apple" virtualFocus={false}>
      <Ariakit.SelectLabel>Fruit</Ariakit.SelectLabel>
      <Ariakit.Select style={{ display: "block" }} />
      <Ariakit.SelectPopover
        gutter={4}
        sameWidth
        focusOnMove={false}
        style={{ background: "white", border: "1px solid gray" }}
      >
        {fruits.map((fruit) => (
          <Ariakit.SelectItem
            key={fruit}
            value={fruit}
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
