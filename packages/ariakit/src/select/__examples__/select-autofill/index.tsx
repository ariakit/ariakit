import {
  Select,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import "./style.css";

export default function Example() {
  const select = useSelectState({ defaultValue: "Student", sameWidth: true });
  return (
    <form className="wrapper">
      <label htmlFor="email">Email</label>
      <input type="email" id="email" className="input" />
      <SelectLabel state={select}>Role</SelectLabel>
      <Select state={select} className="select" />
      <SelectPopover state={select} className="popover">
        <SelectItem className="select-item" value="Student" />
        <SelectItem className="select-item" value="Tutor" />
        <SelectItem className="select-item" value="Parent" />
      </SelectPopover>
    </form>
  );
}
