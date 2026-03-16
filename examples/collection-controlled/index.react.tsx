import * as Ariakit from "@ariakit/react";
import { useState } from "react";

import "./style.css";

export default function Example() {
  const [items, setItems] = useState<Ariakit.CollectionStoreState["items"]>([]);
  const collection = Ariakit.useCollectionStore({ items, setItems });
  return (
    <Ariakit.Collection store={collection} className="collection">
      <div>Items count: {items.length}</div>
      <Ariakit.CollectionItem>🍎 Apple</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>🍇 Grape</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>🍊 Orange</Ariakit.CollectionItem>
    </Ariakit.Collection>
  );
}
