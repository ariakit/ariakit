import * as Ariakit from "@ariakit/react";

const items = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

export default function Example() {
  const select = Ariakit.useComboboxStore({
    defaultSelectedValue: "apple",
  });
  const storeItems = Ariakit.useStoreState(select, "items");
  return (
    <div>
      <Ariakit.ComboboxSelectLabel store={select}>
        Favorite fruit
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={select} />
      <Ariakit.ComboboxPopover store={select} gutter={4} sameWidth>
        {items.map((item) => (
          <Ariakit.ComboboxItem key={item.value} value={item.value}>
            {item.label}
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
      <ul aria-label="Store items">
        {storeItems.map((item) => (
          <li key={item.id}>{item.children}</li>
        ))}
      </ul>
    </div>
  );
}
