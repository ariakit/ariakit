import * as Ariakit from "@ariakit/react";
import { useComboboxItem } from "@ariakit/react-components/combobox/combobox-item";

function NestedListbox() {
  const store = Ariakit.useComboboxStore({ defaultOpen: true });
  const itemProps = useComboboxItem({ store, value: "Inner item" });

  return (
    <>
      <Ariakit.Combobox store={store} aria-label="Inner combobox" />
      <Ariakit.ComboboxPopover
        store={store}
        role="listbox"
        aria-label="Inner list"
      >
        <Ariakit.Role {...itemProps} role="option" />
      </Ariakit.ComboboxPopover>
    </>
  );
}

function StandaloneMenu() {
  const store = Ariakit.useComboboxStore({ defaultOpen: true });
  const itemProps = useComboboxItem({ store, value: "Standalone item" });

  return (
    <>
      <Ariakit.Combobox store={store} aria-label="Standalone combobox" />
      <Ariakit.ComboboxPopover
        store={store}
        role="menu"
        aria-label="Standalone menu"
      >
        <Ariakit.Role {...itemProps} role="menuitem" />
      </Ariakit.ComboboxPopover>
    </>
  );
}

export default function Example() {
  return (
    <>
      <Ariakit.ComboboxProvider defaultOpen>
        <Ariakit.Combobox aria-label="Outer combobox" />
        <Ariakit.ComboboxPopover role="menu" aria-label="Outer menu">
          <NestedListbox />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <StandaloneMenu />
    </>
  );
}
