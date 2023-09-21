import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <form className="wrapper">
      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" className="input" />
      <Ariakit.SelectProvider defaultValue="Student">
        <Ariakit.SelectLabel>Role</Ariakit.SelectLabel>
        <Ariakit.Select name="role" className="button" />
        <Ariakit.SelectPopover sameWidth className="popover">
          <Ariakit.SelectItem className="select-item" value="Student" />
          <Ariakit.SelectItem className="select-item" value="Tutor" />
          <Ariakit.SelectItem className="select-item" value="Parent" />
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </form>
  );
}
