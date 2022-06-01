import { RefObject, useEffect, useState } from "react";
import { Button } from "ariakit/button";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
  useDialogState,
} from "ariakit/dialog";
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

export default function Example() {
  const [menuInitialFocus, setMenuInitialFocus] =
    useState<RefObject<HTMLElement>>();
  const [lists, setLists] = useState(["Future ideas", "My stack"]);

  const menu = useMenuState({
    animated: true,
    defaultValues: { lists: ["My stack"] },
  });

  const dialog = useDialogState({ animated: true });
  const dialog2 = useDialogState({
    setVisible: (visible) => {
      if (!visible) {
        dialog.show();
      }
    },
  });

  // TODO: Manage lists instead of create list, then create list inside the
  // manage list modal.
  const form = useFormState({ defaultValues: { list: "" } });

  form.useSubmit(() => {
    if (form.values.list) {
      setLists((prevLists) => [...prevLists, form.values.list]);
      menu.setValues((prevValues) => ({
        ...prevValues,
        lists: [...prevValues.lists, form.values.list],
      }));
      dialog.hide();
      menu.show();
    }
  });

  useEffect(() => {
    const item = menu.items.find(
      (item) => item.ref.current?.textContent === menu.values.lists.at(-1)
    );
    menu.setAutoFocusOnShow(true);
    setMenuInitialFocus(item?.ref);
  }, [form.submitSucceed]);

  if (!menu.autoFocusOnShow && menuInitialFocus) {
    setMenuInitialFocus(undefined);
  }

  return (
    <>
      <MenuButton state={menu} className="button">
        <MdPlaylistAdd />
        Add to list
        <span className="badge">{menu.values.lists.length}</span>
      </MenuButton>

      <Menu state={menu} initialFocusRef={menuInitialFocus} className="menu">
        <MenuArrow />
        <div role="presentation" className="header">
          <MenuHeading className="heading">Lists</MenuHeading>
          <MenuItem as={MenuDismiss} className="menu-item" />
        </div>
        <div role="presentation" className="scroller">
          {lists.map((list) => (
            <MenuItemCheckbox
              key={list}
              name="lists"
              value={list}
              className="menu-item"
            >
              <MenuItemCheck />
              {list}
            </MenuItemCheckbox>
          ))}
        </div>
        <MenuSeparator className="separator" />
        <MenuItem className="menu-item" onClick={dialog.toggle}>
          <MdAdd />
          Create list
        </MenuItem>
      </Menu>

      <Dialog
        state={dialog}
        className="dialog"
        data-animated={dialog.animated || undefined}
      >
        <header className="header">
          <DialogHeading className="heading">Create list</DialogHeading>
          <DialogDismiss className="button dismiss" />
        </header>
        {dialog.mounted && (
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
        <Button onClick={dialog2.toggle} className="button secondary">
          Learn more about lists
        </Button>
      </Dialog>

      {dialog2.mounted && (
        <Dialog
          state={dialog2}
          modal={!dialog.mounted}
          portal
          className="dialog"
        >
          <header className="header">
            <DialogHeading className="heading">
              Learn more about lists
            </DialogHeading>
            <DialogDismiss className="button dismiss" />
          </header>
          dsadadas
        </Dialog>
      )}
    </>
  );
}
