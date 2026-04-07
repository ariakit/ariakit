import * as Ariakit from "@ariakit/react";
import type { SelectItemProps } from "@ariakit/react";
import { useCallback } from "react";

const items = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

// TODO: Remove this workaround once
// https://github.com/ariakit/ariakit/issues/5691 is fixed.
function useGetItem(): SelectItemProps["getItem"] {
  return useCallback((item) => {
    return { ...item, children: item.element?.textContent ?? item.children };
  }, []);
}

export default function Example() {
  const select = Ariakit.useSelectStore({ defaultValue: "apple" });
  const storeItems = Ariakit.useStoreState(select, "items");
  const getItem = useGetItem();
  return (
    <div>
      <Ariakit.SelectLabel store={select}>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} />
      <Ariakit.SelectPopover store={select} gutter={4} sameWidth>
        {items.map((item) => (
          <Ariakit.SelectItem
            key={item.value}
            value={item.value}
            getItem={getItem}
          >
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
