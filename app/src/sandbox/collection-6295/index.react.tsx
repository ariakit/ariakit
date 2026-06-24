import * as Ariakit from "@ariakit/react";
import { useState } from "react";

interface FruitItem {
  id: string;
  label: string;
  element?: HTMLElement | null;
}

const initialItems: FruitItem[] = [
  { id: "apple", label: "Apple" },
  { id: "grape", label: "Grape" },
  { id: "orange", label: "Orange" },
];

export default function Example() {
  const [items, setItems] = useState(initialItems);
  const [details, setDetails] = useState("");
  const collection = Ariakit.useCollectionStore({ items, setItems });

  const renameApple = () => {
    setItems((items) =>
      items.map((item) =>
        item.id === "apple" ? { ...item, label: "Green Apple" } : item,
      ),
    );
  };

  const showDetails = (id: string) => {
    const item = collection.item(id);
    setDetails(item?.label ?? "Item not found");
  };

  return (
    <div>
      <Ariakit.Collection store={collection}>
        {items.map((item) => (
          <Ariakit.CollectionItem
            key={item.id}
            id={item.id}
            render={<button type="button" />}
            onClick={() => showDetails(item.id)}
          >
            {item.label}
          </Ariakit.CollectionItem>
        ))}
      </Ariakit.Collection>
      <button type="button" onClick={renameApple}>
        Rename Apple
      </button>
      <p>
        Details: <output aria-label="Details">{details}</output>
      </p>
    </div>
  );
}
