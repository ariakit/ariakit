import { RefObject, useRef, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { Dialog } from "./dialog.js";
import { add, playlistAdd } from "./icons.js";
import { Menu } from "./menu.js";
import "./style.css";

function useDisclosure(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(defaultOpen);
  if (open && !mounted) {
    setMounted(true);
  }
  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  const unmount = () => setMounted(false);
  return { open, mounted, setOpen, show, hide, unmount };
}

export default function Example() {
  const [menuInitialFocusRef, setMenuInitialFocusRef] =
    useState<RefObject<HTMLElement>>();

  const createDialogInitialFocusRef = useRef<HTMLElement | null>(null);
  const manageDialogDisclosureRef = useRef<HTMLButtonElement>(null);
  const infoDialogDisclosureRef = useRef<HTMLButtonElement>(null);

  const lastItemRef = useRef<HTMLDivElement>(null);

  const [lists, setLists] = useState(["Future ideas", "My stack"]);
  const [values, setValues] = useState({ selectedLists: ["My stack"] });

  const menu = useDisclosure();
  const createDialog = useDisclosure();
  const manageDialog = useDisclosure();
  const infoDialog = useDisclosure();

  const form = Ariakit.useFormStore({ defaultValues: { list: "" } });

  form.useSubmit((state) => {
    setLists((prevLists) => [...prevLists, state.values.list]);
    setValues((prevValues) => ({
      ...prevValues,
      selectedLists: [...prevValues.selectedLists, state.values.list],
    }));
    // When the form is successfully submitted, we hide the create dialog, show
    // the menu and set the initial focus on the menu to be the newly added
    // item.
    createDialog.hide();
    menu.show();
    setMenuInitialFocusRef(lastItemRef);
  });

  return (
    <>
      <Menu
        title="Lists"
        animated
        initialFocusRef={menuInitialFocusRef}
        values={values}
        setValues={setValues}
        open={menu.open}
        setOpen={(open) => {
          menu.setOpen(open);
          if (!open) {
            // Resets the initial focus when the menu is closed so re-opening
            // the menu will focus on the first item.
            setMenuInitialFocusRef(undefined);
          }
        }}
        label={
          <>
            {playlistAdd}
            Add to list
            <span className="badge">{values.selectedLists.length}</span>
          </>
        }
      >
        <div role="presentation" className="scroller">
          {lists.map((list, i) => (
            <Ariakit.MenuItemCheckbox
              key={list}
              ref={i === lists.length - 1 ? lastItemRef : undefined}
              name="selectedLists"
              value={list}
              className="menu-item"
            >
              <Ariakit.MenuItemCheck />
              {list}
            </Ariakit.MenuItemCheckbox>
          ))}
        </div>
        <Ariakit.MenuSeparator className="separator" />
        <Ariakit.MenuItem className="menu-item" onClick={createDialog.show}>
          {add}
          Create list
        </Ariakit.MenuItem>
      </Menu>

      <Dialog
        title="Create list"
        animated
        open={createDialog.open}
        onClose={() => {
          createDialog.hide();
          createDialogInitialFocusRef.current = null;
        }}
        initialFocusRef={createDialogInitialFocusRef}
        onUnmount={() => {
          form.reset();
          createDialog.unmount();
        }}
      >
        <Ariakit.Form store={form} className="form">
          <div className="field">
            <Ariakit.FormLabel name={form.names.list}>
              List name
            </Ariakit.FormLabel>
            <Ariakit.FormInput
              name={form.names.list}
              placeholder="Favorites"
              required
            />
            <Ariakit.FormError name={form.names.list} className="error" />
          </div>
          <Ariakit.FormSubmit className="button">Create</Ariakit.FormSubmit>
        </Ariakit.Form>
        <Ariakit.Button
          ref={manageDialogDisclosureRef}
          onClick={manageDialog.show}
          className="button secondary"
        >
          Manage lists
        </Ariakit.Button>
        <Ariakit.DialogDismiss
          ref={infoDialogDisclosureRef}
          onClick={infoDialog.show}
          className="button secondary"
        >
          More information
        </Ariakit.DialogDismiss>
      </Dialog>

      {manageDialog.mounted && (
        <Dialog
          title="Manage lists"
          animated
          // We delay the backdrop until the dialog behind is fully hidden (that
          // is, the exit animation is complete) so they don't overlap.
          backdrop={!createDialog.mounted}
          open={manageDialog.open}
          onClose={() => {
            manageDialog.hide();
            createDialog.show();
            createDialogInitialFocusRef.current =
              manageDialogDisclosureRef.current;
          }}
          onUnmount={manageDialog.unmount}
        >
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis et
            officia rerum voluptatem exercitationem omnis laborum? Vero aliquid
            maxime tenetur cum laboriosam perspiciatis cumque molestias
            doloribus nisi, libero vel inventore!
          </p>
        </Dialog>
      )}

      {infoDialog.mounted && (
        <Dialog
          title="More information"
          animated
          backdrop={!createDialog.mounted}
          open={infoDialog.open}
          onClose={() => {
            infoDialog.hide();
            createDialog.show();
            createDialogInitialFocusRef.current =
              infoDialogDisclosureRef.current;
          }}
          onUnmount={infoDialog.unmount}
        >
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis et
            officia rerum voluptatem exercitationem omnis laborum? Vero aliquid
            maxime tenetur cum laboriosam perspiciatis cumque molestias
            doloribus nisi, libero vel inventore!
          </p>
        </Dialog>
      )}
    </>
  );
}
