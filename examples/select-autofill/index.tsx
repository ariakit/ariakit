import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const select = Ariakit.useSelectStore({
    defaultValue: "Student",
    sameWidth: true,
  });
  return (
    <form className="wrapper">
      <label htmlFor="email">Email</label>
      <input type="email" id="email" className="input" />
      <Ariakit.SelectLabel store={select}>Role</Ariakit.SelectLabel>
      <Ariakit.Select store={select} className="select" />
      <Ariakit.SelectPopover store={select} className="popover">
        <Ariakit.SelectItem className="select-item" value="Student" />
        <Ariakit.SelectItem className="select-item" value="Tutor" />
        <Ariakit.SelectItem className="select-item" value="Parent" />
      </Ariakit.SelectPopover>
    </form>
  );
}
