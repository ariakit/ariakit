import "./style.css";
import * as Ariakit from "@ariakit/react";

type CustomItem = {
  id: string;
  element?: HTMLElement | null | undefined;
  color?: string;
};

export default function Example() {
  const collection = Ariakit.useCollectionStore<CustomItem>({ items: [] });
  const renderedItems = collection.useState((state) => state.renderedItems);
  const purpleItems = renderedItems.filter((item) => item.color === "purple");
  return (
    <Ariakit.Collection store={collection} className="collection">
      <div>Purple items: {purpleItems.length}</div>
      <Ariakit.CollectionItem>🍎 Apple</Ariakit.CollectionItem>
      <Ariakit.CollectionItem
        getItem={(item) => ({ ...item, color: "purple" })}
      >
        🍇 Grape
      </Ariakit.CollectionItem>
      <Ariakit.CollectionItem>🍊 Orange</Ariakit.CollectionItem>
    </Ariakit.Collection>
  );
}
