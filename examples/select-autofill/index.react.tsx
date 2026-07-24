import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <form className="wrapper">
      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" className="input" />
      <Ariakit.ComboboxProvider defaultSelectedValue="Student">
        <Ariakit.ComboboxSelectLabel>Role</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect name="role" className="button" />
        <Ariakit.ComboboxPopover sameWidth className="popover">
          <Ariakit.ComboboxItem className="select-item" value="Student" />
          <Ariakit.ComboboxItem className="select-item" value="Tutor" />
          <Ariakit.ComboboxItem className="select-item" value="Parent" />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </form>
  );
}
