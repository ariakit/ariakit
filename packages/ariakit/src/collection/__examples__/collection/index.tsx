import { useState } from "react";
import {
  Collection,
  CollectionItem,
  useCollectionStore,
} from "ariakit/collection/store";
import "./style.css";

export default function Example() {
  const collection = useCollectionStore();
  const length = collection.useState((state) => state.renderedItems.length);
  const [on, setOn] = useState(false);
  return (
    <Collection store={collection} className="collection">
      <div>Items count: {length}</div>
      <button onClick={() => setOn((on) => !on)}>Toggle</button>
      <CollectionItem key="apple">🍎 Apple</CollectionItem>
      {on && <CollectionItem key="grape">🍇 Grape</CollectionItem>}
      <CollectionItem key="orange">🍊 Orange</CollectionItem>
      {!on && <CollectionItem key="grape">🍇 Grape</CollectionItem>}
    </Collection>
  );
}
