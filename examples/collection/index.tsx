import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const collection = Ariakit.useCollectionStore();
  const length = collection.useState((state) => state.renderedItems.length);
  return (
    <Ariakit.Collection store={collection} className="collection">
      <div>Items count: {length}</div>
      <Ariakit.CollectionItem key="apple">🍎 Apple</Ariakit.CollectionItem>
      <Ariakit.CollectionItem key="grape">🍇 Grape</Ariakit.CollectionItem>
      <Ariakit.CollectionItem key="orange">🍊 Orange</Ariakit.CollectionItem>
    </Ariakit.Collection>
  );
}
