import * as Ariakit from "@ariakit/react";
import { batch } from "@ariakit/store";
import type { ComponentPropsWithRef } from "react";
import { useDeferredValue, useEffect, useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  const deferredOpen = useDeferredValue(open);
  const combobox = Ariakit.useComboboxStore({
    includesBaseElement: false,
    open,
    setOpen,
  });
  const select = Ariakit.useSelectStore({
    combobox,
    value: "Components",
  });
  const menu = Ariakit.useMenuStore({ combobox });

  useEffect(() => {
    if (!open) return;
    menu.setAutoFocusOnShow(true);
  }, [menu, open]);

  useEffect(() => {
    return batch(select, ["selectElement", "disclosureElement"], (state) => {
      menu.setDisclosureElement(state.selectElement);
      select.setDisclosureElement(state.selectElement);
      combobox.setDisclosureElement(state.selectElement);
    });
  }, [combobox, menu, select]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      setOpen(true);
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  const renderPopover = (props: ComponentPropsWithRef<"div">) => (
    <Ariakit.Role {...props}>
      {deferredOpen && (
        <>
          <Ariakit.Combobox store={combobox} placeholder="Search pages" />
          <Ariakit.ComboboxList store={combobox}>
            <Ariakit.ComboboxItem store={combobox} value="Components" />
            <Ariakit.ComboboxItem store={combobox} value="Examples" />
          </Ariakit.ComboboxList>
        </>
      )}
    </Ariakit.Role>
  );

  return (
    <>
      <Ariakit.Select store={select} aria-label="Current page">
        Components
      </Ariakit.Select>
      <Ariakit.SelectPopover
        store={select}
        typeahead={false}
        composite={false}
        unmountOnHide
        render={
          <Ariakit.MenuList
            store={menu}
            typeahead={false}
            composite={false}
            render={renderPopover}
          />
        }
      />
    </>
  );
}
