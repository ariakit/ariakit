import * as Ariakit from "@ariakit/react";

const fruits = ["Apple", "Banana", "Orange"];

export default function Example() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue={["Apple"]}>
      <Ariakit.ComboboxSelectLabel>Favorite fruits</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4} sameWidth>
        {fruits.map((fruit) => (
          <Ariakit.ComboboxItem key={fruit} value={fruit}>
            <Ariakit.ComboboxItemSelected>
              {(selected) =>
                `${fruit} (${selected ? "selected" : "not selected"})`
              }
            </Ariakit.ComboboxItemSelected>
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
