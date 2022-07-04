import { RefObject, useRef, useState } from "react";
import { Button } from "ariakit/button";
import { DialogDismiss } from "ariakit/dialog";
import {
  Form,
  FormError,
  FormInput,
  FormLabel,
  FormSubmit,
  useFormState,
} from "ariakit/form";
import {
  MenuItem,
  MenuItemCheck,
  MenuItemCheckbox,
  MenuSeparator,
} from "ariakit/menu";
import { MdAdd, MdPlaylistAdd } from "react-icons/md";
import { Dialog } from "./dialog";
import { Menu } from "./menu";
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
  const lastItemRef = useRef<HTMLDivElement>(null);
  const infoDialogFinalFocusRef = useRef<HTMLButtonElement>(null);

  const [lists, setLists] = useState(["Future ideas", "My stack"]);
  const [values, setValues] = useState({ selectedLists: ["My stack"] });

  const menu = useDisclosure();
  const createDialog = useDisclosure();
  const manageDialog = useDisclosure();
  const infoDialog = useDisclosure();

  const form = useFormState({ defaultValues: { list: "" } });

  form.useSubmit(() => {
    setLists((prevLists) => [...prevLists, form.values.list]);
    setValues((prevValues) => ({
      ...prevValues,
      selectedLists: [...prevValues.selectedLists, form.values.list],
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
            <MdPlaylistAdd />
            Add to list
            <span className="badge">{values.selectedLists.length}</span>
          </>
        }
      >
        <div role="presentation" className="scroller">
          {lists.map((list, i) => (
            <MenuItemCheckbox
              key={list}
              ref={i === lists.length - 1 ? lastItemRef : undefined}
              name="selectedLists"
              value={list}
              className="menu-item"
            >
              <MenuItemCheck />
              {list}
            </MenuItemCheckbox>
          ))}
        </div>
        <MenuSeparator className="separator" />
        <MenuItem className="menu-item" onClick={createDialog.show}>
          <MdAdd />
          Create list
        </MenuItem>
      </Menu>

      <Dialog
        title="Create list"
        animated
        open={createDialog.open}
        onClose={createDialog.hide}
        onUnmount={() => {
          form.reset();
          createDialog.unmount();
        }}
      >
        <Form state={form} className="form">
          <div className="field">
            <FormLabel name={form.names.list}>List name</FormLabel>
            <FormInput
              name={form.names.list}
              placeholder="Favorites"
              required
            />
            <FormError name={form.names.list} className="error" />
          </div>
          <FormSubmit className="button">Create</FormSubmit>
        </Form>
        <Button onClick={manageDialog.show} className="button secondary">
          Manage lists
        </Button>
        <DialogDismiss
          ref={infoDialogFinalFocusRef}
          onClick={infoDialog.show}
          className="button secondary"
        >
          More information
        </DialogDismiss>
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
          finalFocusRef={infoDialogFinalFocusRef}
          backdrop={!createDialog.mounted}
          open={infoDialog.open}
          onClose={() => {
            infoDialog.hide();
            createDialog.show();
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
