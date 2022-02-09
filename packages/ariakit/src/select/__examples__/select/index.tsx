import {
  Select,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import "./style.css";

export default function Example() {
  const select = useSelectState({ defaultValue: "Apple", gutter: 4 });
  return (
    <div className="wrapper">
      <SelectLabel state={select}>Favorite fruit</SelectLabel>
      <Select state={select} className="select" />
      <SelectPopover state={select} className="popover">
        <SelectItem className="item" value="Apple" />
        <SelectItem className="item" value="Banana" />
        <SelectItem className="item" value="Grape" disabled />
        <SelectItem className="item" value="Orange" />
      </SelectPopover>
    </div>
  );
}
