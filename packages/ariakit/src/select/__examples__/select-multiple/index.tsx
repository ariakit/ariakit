import {
  Select,
  SelectArrow,
  SelectItem,
  SelectItemCheck,
  SelectLabel,
  SelectPopover,
  useSelectStore,
} from "ariakit/select/store";
import list from "./list";
import "./style.css";

function renderValue(value: string[]) {
  if (value.length === 0) return "No food selected";
  if (value.length === 1) return value[0];
  return `${value.length} food selected`;
}

export default function Example() {
  const select = useSelectStore({
    defaultValue: ["Apple", "Cake"],
    sameWidth: true,
    gutter: 4,
  });
  const value = select.useState("value");
  const mounted = select.useState("mounted");
  return (
    <div className="wrapper">
      <SelectLabel store={select}>Favorite food</SelectLabel>
      <Select store={select} className="select">
        {renderValue(value)}
        <SelectArrow />
      </Select>
      {mounted && (
        <SelectPopover store={select} className="popover">
          {list.map((value) => (
            <SelectItem key={value} value={value} className="select-item">
              <SelectItemCheck />
              {value}
            </SelectItem>
          ))}
        </SelectPopover>
      )}
    </div>
  );
}
