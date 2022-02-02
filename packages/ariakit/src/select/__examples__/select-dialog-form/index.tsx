import { useEffect, useState } from "react";
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
  Select,
  SelectArrow,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import startCase from "lodash/startCase";
import "./style.css";

function renderValue(email: string) {
  const [username = ""] = email.split("@");
  const name = startCase(username.replace(/[._]/g, " "));
  const image = `https://i.pravatar.cc/120?u=${email}`;
  return (
    <>
      <img key={image} src={image} alt="" aria-hidden className="photo" />
      <div className="value">
        <div className="name">{name}</div>
        <div className="email">{email}</div>
      </div>
    </>
  );
}

export default function Example() {
  const [accounts, setAccounts] = useState([
    "john.doe@example.com",
    "jane.doe@example.com",
  ]);
  const select = useSelectState({
    defaultValue: accounts[0],
    animated: true,
  });
  const dialog = useDialogState({ animated: true });
  const form = useFormState({
    defaultValues: {
      email: "",
    },
  });
  form.useSubmit(() => {
    const email = form.values.email;
    setAccounts((prevAccounts) => [...prevAccounts, email]);
    select.setValue(email);
    dialog.hide();
  });

  useEffect(() => {
    if (!dialog.visible) {
      form.reset();
    }
  }, [dialog.visible, form.reset]);
  return (
    <div className="wrapper">
      <SelectLabel state={select}>Account</SelectLabel>
      <Select state={select} className="select">
        {renderValue(select.value)}
        <SelectArrow />
      </Select>
      <SelectPopover state={select} className="popover">
        {accounts.map((email) => (
          <SelectItem key={email} value={email}>
            {renderValue(email)}
          </SelectItem>
        ))}
        <SelectItem
          onClick={() => {
            select.hide();
            dialog.toggle();
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            alt=""
            aria-hidden
            className="photo"
          />
          <div className="value">Add another account...</div>
        </SelectItem>
      </SelectPopover>
      {dialog.mounted && (
        <Dialog
          state={dialog}
          className="dialog"
          finalFocusRef={select.selectRef}
        >
          <header>
            <DialogHeading className="heading">Add account</DialogHeading>
            <DialogDismiss className="dismiss" />
          </header>
          <Form
            state={form}
            className="form"
            validateOnBlur={!!form.getError(form.names.email)}
            validateOnChange={!!form.getError(form.names.email)}
          >
            <div className="field">
              <FormLabel name={form.names.email}>Email</FormLabel>
              <FormInput
                name={form.names.email}
                type="email"
                placeholder="email@example.com"
                autoComplete="off"
                required
              />
              <FormError name={form.names.email} className="error" />
            </div>
            <FormSubmit className="button">Add</FormSubmit>
          </Form>
        </Dialog>
      )}
    </div>
  );
}
