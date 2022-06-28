import { RefObject, useEffect, useState } from "react";
import { Button } from "ariakit/button";
import {
  Form,
  FormError,
  FormInput,
  FormLabel,
  FormSubmit,
  useFormState,
} from "ariakit/form";
import {
  Menu,
  MenuArrow,
  MenuButton,
  MenuDismiss,
  MenuHeading,
  MenuItem,
  MenuItemCheck,
  MenuItemCheckbox,
  MenuSeparator,
  useMenuState,
} from "ariakit/menu";
import { MdAdd, MdPlaylistAdd } from "react-icons/md";
import "./style.css";
import { Dialog } from "./dialog";

export default function Example() {
  const [menuInitialFocusRef, setMenuInitialFocusRef] =
    useState<RefObject<HTMLElement>>();
  const [lists, setLists] = useState(["Future ideas", "My stack"]);

  const listMenu = useMenuState({
    animated: true,
    defaultValues: { selectedLists: ["My stack"] },
  });

  const [createListDialogOpen, setCreateListDialogOpen] = useState(false);
  const [createListDialogMounted, setCreateListDialogMounted] = useState(false);

  if (createListDialogOpen && !createListDialogMounted) {
    setCreateListDialogMounted(true);
  }

  const [listsInfoDialogOpen, setListsInfoDialogOpen] = useState(false);
  const [listsInfoDialogMounted, setListsInfoDialogMounted] = useState(false);

  if (listsInfoDialogOpen && !listsInfoDialogMounted) {
    setListsInfoDialogMounted(true);
  }

  const form = useFormState({ defaultValues: { list: "" } });

  form.useSubmit(() => {
    if (form.values.list) {
      setLists((prevLists) => [...prevLists, form.values.list]);
      listMenu.setValues((prevValues) => ({
        ...prevValues,
        selectedLists: [...prevValues.selectedLists, form.values.list],
      }));
      listMenu.show();
      setCreateListDialogOpen(false);
    }
  });

  useEffect(() => {
    if (!form.submitSucceed) return;
    const item = listMenu.items.find(
      (item) => item.ref.current?.textContent === lists[lists.length - 1]
    );
    listMenu.setAutoFocusOnShow(true);
    setMenuInitialFocusRef(item?.ref);
  }, [form.submitSucceed, listMenu.items, lists, listMenu.setAutoFocusOnShow]);

  if (!listMenu.autoFocusOnShow && menuInitialFocusRef) {
    setMenuInitialFocusRef(undefined);
  }

  return (
    <>
      <MenuButton state={listMenu} className="button">
        <MdPlaylistAdd />
        Add to list
        <span className="badge">{listMenu.values.selectedLists.length}</span>
      </MenuButton>

      <Menu
        state={listMenu}
        initialFocusRef={menuInitialFocusRef}
        className="menu"
      >
        <MenuArrow />
        <div role="presentation" className="header">
          <MenuHeading className="heading">Lists</MenuHeading>
          <MenuItem as={MenuDismiss} className="menu-item" />
        </div>
        <div role="presentation" className="scroller">
          {lists.map((list) => (
            <MenuItemCheckbox
              key={list}
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
        <MenuItem
          className="menu-item"
          onClick={() => setCreateListDialogOpen(true)}
        >
          <MdAdd />
          Create list
        </MenuItem>
      </Menu>

      <Dialog
        title="Create list"
        animated
        open={createListDialogOpen}
        onClose={() => setCreateListDialogOpen(false)}
        onUnmount={() => setCreateListDialogMounted(false)}
      >
        {createListDialogMounted && (
          <Form state={form} resetOnSubmit resetOnUnmount className="form">
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
        )}
        <Button
          onClick={() => setListsInfoDialogOpen(true)}
          className="button secondary"
        >
          Learn more about lists
        </Button>
      </Dialog>

      {listsInfoDialogMounted && (
        <Dialog
          title="About lists"
          animated
          open={listsInfoDialogOpen}
          onClose={() => {
            setCreateListDialogOpen(true);
            setListsInfoDialogOpen(false);
          }}
          backdrop={!createListDialogMounted}
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
