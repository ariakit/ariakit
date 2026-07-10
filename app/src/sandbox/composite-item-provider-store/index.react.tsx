import * as Ariakit from "@ariakit/react";
import { useStoreStateObject } from "@ariakit/react-components/store";
import "./style.css";

// Reads state directly from provider components instead of store objects.
// `useStoreState` and `useStoreStateObject` resolve each provider component
// through that provider's context, so this works without threading stores as
// props.
function StoreStatus() {
  const { comboboxValue, comboboxItemCount } = useStoreStateObject(
    Ariakit.ComboboxProvider,
    {
      comboboxValue: "value",
      comboboxItemCount: (state) => state?.renderedItems.length ?? 0,
    },
  );
  const toolbarItemCount = Ariakit.useStoreState(
    Ariakit.ToolbarProvider,
    (state) => state?.renderedItems.length ?? 0,
  );
  return (
    <div className="status">
      <output aria-label="Combobox value">{comboboxValue}</output>
      <output aria-label="Combobox items">{comboboxItemCount}</output>
      <output aria-label="Toolbar items">{toolbarItemCount}</output>
    </div>
  );
}

// Rendered outside any ComboboxProvider. Because a provider component is an
// explicit reference with no fallback, `useStoreState` resolves to `undefined`
// here even though a ComboboxProvider exists elsewhere in the tree.
function OutsideStatus() {
  const value = Ariakit.useStoreState(Ariakit.ComboboxProvider, "value");
  return <output aria-label="Outside combobox value">{value ?? "none"}</output>;
}

export default function Example() {
  return (
    <>
      <OutsideStatus />
      <ComboboxWithToolbar />
      <OutsideCollection />
    </>
  );
}

function ComboboxWithToolbar() {
  return (
    <Ariakit.ComboboxProvider defaultValue="Apple">
      <Ariakit.ComboboxLabel>Fruit</Ariakit.ComboboxLabel>
      <Ariakit.Combobox className="combobox" />
      <Ariakit.ToolbarProvider>
        <Ariakit.Toolbar className="toolbar" aria-label="Fruit actions">
          {/* Binds to the nearest Toolbar, its closest composite context. */}
          <Ariakit.ToolbarItem className="button">Clear</Ariakit.ToolbarItem>
          {/* Explicitly binds to the Combobox by passing the provider
              component, even though the Toolbar is the closer composite
              context. It becomes a combobox item, not a toolbar item. */}
          <Ariakit.CompositeItem
            store={Ariakit.ComboboxProvider}
            className="button"
          >
            Combobox item
          </Ariakit.CompositeItem>
        </Ariakit.Toolbar>
        <StoreStatus />
      </Ariakit.ToolbarProvider>
    </Ariakit.ComboboxProvider>
  );
}

// Rendered outside any ComboboxProvider. The second CollectionItem explicitly
// targets ComboboxProvider, and provider components have no fallback, so it
// must not register with the closer collection even though that compatible
// context is right above it.
function OutsideCollection() {
  return (
    <Ariakit.CollectionProvider>
      <Ariakit.Collection className="collection">
        <Ariakit.CollectionItem className="button" render={<button />}>
          Plain item
        </Ariakit.CollectionItem>
        <Ariakit.CollectionItem
          className="button"
          render={<button />}
          store={Ariakit.ComboboxProvider}
        >
          Outside combobox item
        </Ariakit.CollectionItem>
      </Ariakit.Collection>
      <OutsideCollectionStatus />
    </Ariakit.CollectionProvider>
  );
}

function OutsideCollectionStatus() {
  const collectionItemCount = Ariakit.useStoreState(
    Ariakit.CollectionProvider,
    (state) => state?.renderedItems.length ?? 0,
  );
  return (
    <output aria-label="Outside collection items">{collectionItemCount}</output>
  );
}
