import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const [items, setItems] = useState<Ariakit.CollectionStoreState["items"]>([]);
  return (
    <div className="collection">
      <Ariakit.CollectionProvider setItems={setItems}>
        <div>Items count: {items.length}</div>
        <Ariakit.CollectionItem>🍎 Apple</Ariakit.CollectionItem>
        <Ariakit.CollectionItem>🍇 Grape</Ariakit.CollectionItem>
        <Ariakit.CollectionItem>🍊 Orange</Ariakit.CollectionItem>
      </Ariakit.CollectionProvider>
    </div>
  );
}
