import {
  Select,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectStore,
} from "ariakit/select/store";
import "./style.css";

export default function Example() {
  const select = useSelectStore({ defaultValue: "Student", sameWidth: true });
  return (
    <form className="wrapper">
      <label htmlFor="email">Email</label>
      <input type="email" id="email" className="input" />
      <SelectLabel store={select}>Role</SelectLabel>
      <Select store={select} className="select" />
      <SelectPopover store={select} className="popover">
        <SelectItem className="select-item" value="Student" />
        <SelectItem className="select-item" value="Tutor" />
        <SelectItem className="select-item" value="Parent" />
      </SelectPopover>
    </form>
  );
}
