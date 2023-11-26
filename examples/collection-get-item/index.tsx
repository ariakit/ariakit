import "./style.css";
import { useCallback } from "react";
import * as Ariakit from "@ariakit/react";

interface Item {
  id: string;
  element?: HTMLElement | null | undefined;
}

interface CustomItem extends Item {
  custom?: boolean;
}

export default function Example() {
  const collection = Ariakit.useCollectionStore<CustomItem>({
    defaultItems: [],
  });
  const getItem = useCallback((item: Item) => ({ ...item, custom: true }), []);
  const renderedItems = collection.useState((state) => state.renderedItems);
  const customItems = renderedItems.filter((item) => item.custom === true);

  return (
    <Ariakit.Collection store={collection} className="collection">
      <div>Custom items: {customItems.length}</div>
      <Ariakit.CollectionItem>🍎 Apple</Ariakit.CollectionItem>
      <Ariakit.CollectionItem getItem={getItem}>
        🍇 Grape
      </Ariakit.CollectionItem>
      <Ariakit.CollectionItem>🍊 Orange</Ariakit.CollectionItem>
    </Ariakit.Collection>
  );
}
