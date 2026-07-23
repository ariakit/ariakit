import * as Ariakit from "@ariakit/react";

const fruits = ["Apple", "Banana", "Orange"];

export default function Example() {
  return (
    <Ariakit.SelectProvider defaultValue={["Apple"]}>
      <Ariakit.SelectLabel>Favorite fruits</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} sameWidth>
        {fruits.map((fruit) => (
          <Ariakit.SelectItem key={fruit} value={fruit}>
            <Ariakit.SelectItemSelected>
              {(selected) =>
                `${fruit} (${selected ? "selected" : "not selected"})`
              }
            </Ariakit.SelectItemSelected>
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
