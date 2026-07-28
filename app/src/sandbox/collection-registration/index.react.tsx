import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";

function UncontrolledCollection() {
  const collection = Ariakit.useCollectionStore();
  const count = Ariakit.useStoreState(
    collection,
    (state) => state.renderedItems.length,
  );
  return (
    <Ariakit.Collection store={collection}>
      <output aria-label="Uncontrolled items">{count}</output>
      <Ariakit.CollectionItem>Apple</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>Grape</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>Orange</Ariakit.CollectionItem>
    </Ariakit.Collection>
  );
}

function ControlledCollection() {
  const [items, setItems] = useState<Ariakit.CollectionStoreState["items"]>([]);
  const collection = Ariakit.useCollectionStore({ items, setItems });
  return (
    <Ariakit.Collection store={collection}>
      <output aria-label="Controlled items">{items.length}</output>
      <Ariakit.CollectionItem>Apple</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>Grape</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>Orange</Ariakit.CollectionItem>
    </Ariakit.Collection>
  );
}

function ControlledProviderCollection() {
  const [items, setItems] = useState<Ariakit.CollectionStoreState["items"]>([]);
  return (
    <Ariakit.CollectionProvider setItems={setItems}>
      <output aria-label="Provider items">{items.length}</output>
      <Ariakit.CollectionItem>Apple</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>Grape</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>Orange</Ariakit.CollectionItem>
    </Ariakit.CollectionProvider>
  );
}

interface CustomItem {
  id: string;
  element?: HTMLElement | null;
  custom?: boolean;
}

function CustomItemCollection() {
  const collection = Ariakit.useCollectionStore<CustomItem>({
    defaultItems: [],
  });
  const getItem = useCallback(
    (item: CustomItem) => ({ ...item, custom: true }),
    [],
  );
  const renderedItems = Ariakit.useStoreState(collection, "renderedItems");
  const customItems = renderedItems.filter((item) => item.custom);
  return (
    <Ariakit.Collection store={collection}>
      <output aria-label="Custom items">{customItems.length}</output>
      <Ariakit.CollectionItem>Apple</Ariakit.CollectionItem>
      <Ariakit.CollectionItem getItem={getItem}>Grape</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>Orange</Ariakit.CollectionItem>
    </Ariakit.Collection>
  );
}

function UnregisteredItemCollection() {
  const collection = Ariakit.useCollectionStore();
  const count = Ariakit.useStoreState(
    collection,
    (state) => state.renderedItems.length,
  );
  return (
    <Ariakit.Collection store={collection}>
      <output aria-label="Registered items">{count}</output>
      <Ariakit.CollectionItem>Apple</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>Grape</Ariakit.CollectionItem>
      <Ariakit.CollectionItem shouldRegisterItem={false}>
        Orange
      </Ariakit.CollectionItem>
    </Ariakit.Collection>
  );
}

export default function Example() {
  return (
    <main>
      <h1>Collection registration</h1>
      <UncontrolledCollection />
      <ControlledCollection />
      <ControlledProviderCollection />
      <CustomItemCollection />
      <UnregisteredItemCollection />
    </main>
  );
}
