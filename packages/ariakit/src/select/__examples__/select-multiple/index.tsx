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

function renderValue(value: string[]) {
  if (value.length === 0) return "No food selected";
  if (value.length === 1) return value[0];
  return `${value.length} food selected`;
}

export default function Example() {
  const select = useSelectState({ defaultValue: ["Apple", "Cake"] });
  return (
    <div className="wrapper">
      <SelectLabel state={select}>Favorite food</SelectLabel>
      <Select state={select} className="select">
        {renderValue(select.value)}
        <SelectArrow />
      </Select>
      {select.mounted && (
        <SelectPopover state={select} className="popover">
          {list.map((value) => (
            <SelectItem key={value} value={value} className="item">
              <SelectItemCheck />
              {value}
            </SelectItem>
          ))}
        </SelectPopover>
      )}
    </div>
  );
}
