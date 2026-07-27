import * as Ariakit from "@ariakit/react";

const items = [
  { id: "apple", value: "Apple" },
  { id: "banana", value: "Banana" },
  { id: "grape", value: "Grape", disabled: true },
  { id: "orange", value: "Orange" },
] satisfies Ariakit.SelectItemProps[];

export default function Example() {
  return (
    <Ariakit.SelectProvider defaultItems={items} defaultValue="Apple">
      <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover sameWidth gutter={4} unmountOnHide>
        {items.map((item) => (
          <Ariakit.SelectItem key={item.id} {...item} />
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
