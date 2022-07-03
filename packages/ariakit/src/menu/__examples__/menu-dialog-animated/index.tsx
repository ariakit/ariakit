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
  MenuItem,
  MenuItemCheck,
  MenuItemCheckbox,
  MenuSeparator,
} from "ariakit/menu";
import { MdAdd, MdPlaylistAdd } from "react-icons/md";
import "./style.css";
import { Dialog } from "./dialog";
import { Menu, MenuProps } from "./menu";

export default function Example() {
  const [menuInitialFocusRef, setMenuInitialFocusRef] =
    useState<RefObject<HTMLElement>>();
  const [lists, setLists] = useState(["Future ideas", "My stack"]);

  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [listMenuItems, setListMenuItems] = useState<
    NonNullable<MenuProps["items"]>
  >([]);
  const [values, setValues] = useState({ selectedLists: ["My stack"] });

  const [createListDialogOpen, setCreateListDialogOpen] = useState(false);
  const [createListDialogMounted, setCreateListDialogMounted] = useState(false);

  const [listsInfoDialogOpen, setListsInfoDialogOpen] = useState(false);
  const [listsInfoDialogMounted, setListsInfoDialogMounted] = useState(false);

  const form = useFormState({ defaultValues: { list: "" } });

  form.useSubmit(() => {
    if (form.values.list) {
      setLists((prevLists) => [...prevLists, form.values.list]);
      setValues((prevValues) => ({
        ...prevValues,
        selectedLists: [...prevValues.selectedLists, form.values.list],
      }));
      setListMenuOpen(true);
      setCreateListDialogOpen(false);
    }
  });

  useEffect(() => {
    if (!form.submitSucceed) return;
    const item = listMenuItems.find(
      (item) => item.ref.current?.textContent === lists[lists.length - 1]
    );
    setMenuInitialFocusRef(item?.ref);
  }, [form.submitSucceed, listMenuItems, lists]);

  return (
    <>
      <Menu
        title="Lists"
        animated
        items={listMenuItems}
        onItemsChange={setListMenuItems}
        open={listMenuOpen}
        onOpenChange={(open) => {
          setListMenuOpen(open);
          if (!open) {
            setMenuInitialFocusRef(undefined);
          }
        }}
        values={values}
        onValuesChange={setValues}
        initialFocusRef={menuInitialFocusRef}
        label={
          <>
            <MdPlaylistAdd />
            Add to list
            <span className="badge">{values.selectedLists.length}</span>
          </>
        }
      >
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
          onClick={() => {
            setCreateListDialogMounted(true);
            setCreateListDialogOpen(true);
          }}
        >
          <MdAdd />
          Create list
        </MenuItem>
      </Menu>

      <Dialog
        animated
        title="Create list"
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
          onClick={() => {
            setListsInfoDialogMounted(true);
            setListsInfoDialogOpen(true);
          }}
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
          backdrop={!createListDialogMounted}
          onClose={() => {
            setCreateListDialogMounted(true);
            setCreateListDialogOpen(true);
            setListsInfoDialogOpen(false);
          }}
          onUnmount={() => setListsInfoDialogMounted(false)}
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
