import {
  Select,
  SelectArrow,
  SelectItem,
  SelectItemCheck,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import list from "./list";
import "./style.css";

export default function Example() {
  const select = useSelectState({ defaultValue: ["Apple"], gutter: 4 });
  return (
    <div className="wrapper">
      <SelectLabel state={select}>Favorite fruit</SelectLabel>
      <Select state={select} className="select">
        {select.value}
        <SelectArrow />
      </Select>
      {select.mounted && (
        <SelectPopover state={select} className="popover">
          {list.map((value) => (
            <SelectItem key={value} value={value}>
              <SelectItemCheck />
              {value}
            </SelectItem>
          ))}
        </SelectPopover>
      )}
    </div>
  );
}
