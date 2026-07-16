import * as Ariakit from "@ariakit/react";
import "./style.css";

const items = Array.from({ length: 3000 }, (_, index) => ({
  id: `item-${index + 1}`,
  title: `Item ${index + 1}`,
}));

const fields = [
  "Name",
  "Email",
  "Username",
  "Company",
  "Role",
  "Location",
  "Website",
  "Bio",
];

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  return (
    <div className="root">
      <Ariakit.Button className="button" onClick={dialog.show}>
        Open dialog
      </Ariakit.Button>
      <ul className="grid">
        {items.map((item) => (
          <li key={item.id} className="card">
            <h2 className="card-title">{item.title}</h2>
            <p>Description for {item.title}</p>
            <Ariakit.Button className="button">Action</Ariakit.Button>
          </li>
        ))}
      </ul>
      <Ariakit.Dialog
        className="dialog"
        store={dialog}
        unmountOnHide
        backdrop={<div className="backdrop" />}
      >
        <Ariakit.DialogHeading className="heading">
          Settings
        </Ariakit.DialogHeading>
        <Ariakit.DialogDescription>
          Update your profile information.
        </Ariakit.DialogDescription>
        <form className="form">
          {fields.map((field) => (
            <label key={field} className="field">
              {field}
              <input className="input" name={field.toLowerCase()} />
            </label>
          ))}
          <div className="actions">
            <Ariakit.DialogDismiss className="button">
              Cancel
            </Ariakit.DialogDismiss>
            <Ariakit.Button className="button">Save</Ariakit.Button>
          </div>
        </form>
      </Ariakit.Dialog>
    </div>
  );
}
