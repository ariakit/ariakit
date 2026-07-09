import * as Ariakit from "@ariakit/react";
import { useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6295
//
// The controlled `items` state is the source of truth for item metadata
// (label), but `collection.item(id)` drops it: rendered items resolve to the
// bare registration object, controlled updates are ignored, and items added
// to the state without rendering aren't found at all.

interface FruitItem {
  id: string;
  label: string;
  hidden?: boolean;
  element?: HTMLElement | null;
}

export default function Example() {
  const [items, setItems] = useState<FruitItem[]>([
    { id: "apple", label: "Apple" },
    { id: "grape", label: "Grape" },
    { id: "orange", label: "Orange" },
  ]);
  const [details, setDetails] = useState("");
  const collection = Ariakit.useCollectionStore({ items, setItems });

  function renameApple() {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === "apple" ? { ...item, label: "Green Apple" } : item,
      ),
    );
  }

  function addKiwi() {
    setItems((prevItems) => [
      ...prevItems,
      { id: "kiwi", label: "Kiwi", hidden: true },
    ]);
  }

  function showDetails(id: string) {
    const item = collection.item(id);
    setDetails(item?.label ?? "Item not found");
  }

  return (
    <div>
      <Ariakit.Collection store={collection}>
        {items
          .filter((item) => !item.hidden)
          .map((item) => (
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
      <button type="button" onClick={addKiwi}>
        Add Kiwi
      </button>
      <button type="button" onClick={() => showDetails("kiwi")}>
        Show Kiwi details
      </button>
      <output>{details}</output>
    </div>
  );
}
