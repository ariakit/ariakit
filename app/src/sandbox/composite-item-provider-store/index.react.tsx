import * as Ariakit from "@ariakit/react";
import "./style.css";

// Reads state directly from provider components instead of store objects.
// `useStoreState` resolves each provider component to the closest matching
// provider through context, so this works without threading stores as props.
function StoreStatus() {
  const comboboxValue = Ariakit.useStoreState(
    Ariakit.ComboboxProvider,
    "value",
  );
  const comboboxItemCount = Ariakit.useStoreState(
    Ariakit.ComboboxProvider,
    (state) => state?.renderedItems.length ?? 0,
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
            Focus first option
          </Ariakit.CompositeItem>
        </Ariakit.Toolbar>
        <StoreStatus />
      </Ariakit.ToolbarProvider>
    </Ariakit.ComboboxProvider>
  );
}
