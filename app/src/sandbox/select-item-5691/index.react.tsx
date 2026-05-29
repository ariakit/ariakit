import * as Ariakit from "@ariakit/react";

const items = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

export default function Example() {
  const select = Ariakit.useSelectStore({ defaultValue: "apple" });
  const storeItems = Ariakit.useStoreState(select, "items");
  return (
    <div>
      <Ariakit.SelectLabel store={select}>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} />
      <Ariakit.SelectPopover store={select} gutter={4} sameWidth>
        {items.map((item) => (
          <Ariakit.SelectItem key={item.value} value={item.value}>
            {item.label}
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
      <ul aria-label="Store items">
        {storeItems.map((item) => (
          <li key={item.id}>{item.children}</li>
        ))}
      </ul>
    </div>
  );
}
