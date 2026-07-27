import * as Ariakit from "@ariakit/react";

const groups = [
  ["Fruits & Vegetables", ["Apple", "Banana", "Grape", "Orange"]],
  ["Dairy", ["Milk", "Cheese", "Yogurt"]],
  ["Beverages", ["Water", "Juice", "Soda"]],
  ["Snacks", ["Chips", "Nuts", "Candy"]],
] as const;

export default function Example() {
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>Favorite food</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover
        gutter={4}
        sameWidth
        className="max-h-[120px] overflow-auto"
      >
        {groups.map(([label, items]) => (
          <Ariakit.SelectGroup key={label}>
            <Ariakit.SelectGroupLabel>{label}</Ariakit.SelectGroupLabel>
            {items.map((value) => (
              <Ariakit.SelectItem key={value} value={value} />
            ))}
          </Ariakit.SelectGroup>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
