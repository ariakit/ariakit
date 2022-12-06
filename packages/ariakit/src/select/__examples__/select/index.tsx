import {
  Select,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectStore,
} from "ariakit/select/store";
import "./style.css";

export default function Example() {
  const select = useSelectStore({
    defaultValue: "Apple",
    sameWidth: true,
    gutter: 4,
  });
  return (
    <div className="wrapper">
      <SelectLabel store={select}>Favorite fruit</SelectLabel>
      <Select store={select} className="select" />
      <SelectPopover store={select} className="popover">
        <SelectItem className="select-item" value="Apple" />
        <SelectItem className="select-item" value="Banana" />
        <SelectItem className="select-item" value="Grape" disabled />
        <SelectItem className="select-item" value="Orange" />
      </SelectPopover>
    </div>
  );
}
