import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";
import { CollectionProvider } from "@ariakit/react-core/collection/collection-provider";

export default function Example() {
  const [items, setItems] = useState<Ariakit.CollectionStoreState["items"]>([]);
  return (
    <CollectionProvider items={items} setItems={setItems}>
      <Ariakit.Collection className="collection">
        <div>Items count: {items.length}</div>
        <Ariakit.CollectionItem>🍎 Apple</Ariakit.CollectionItem>
        <Ariakit.CollectionItem>🍇 Grape</Ariakit.CollectionItem>
        <Ariakit.CollectionItem>🍊 Orange</Ariakit.CollectionItem>
      </Ariakit.Collection>
    </CollectionProvider>
  );
}
