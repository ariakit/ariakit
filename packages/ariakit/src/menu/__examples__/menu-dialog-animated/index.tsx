import { RefObject, useEffect, useRef, useState } from "react";
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

      {dialog.mounted && (
        <Dialog state={dialog} className="dialog">
          <header className="header">
            <DialogHeading className="heading">Create list</DialogHeading>
            <DialogDismiss className="button dismiss" />
          </header>
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
        </Dialog>
      )}
    </>
  );
}
