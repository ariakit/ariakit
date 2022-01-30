import {
  Select,
  SelectArrow,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import "./style.css";

export default function Example() {
  const select = useSelectState({ defaultValue: "Apple" });
  return (
    <div className="wrapper">
      <SelectLabel state={select}>Favorite fruit</SelectLabel>
      <Select state={select}>
        {select.value}
        <SelectArrow />
      </Select>
      <SelectPopover state={select}>
        <SelectItem value="Apple" />
        <SelectItem value="Banana" />
        <SelectItem value="Cherry" />
        <SelectItem value="Grape" />
        <SelectItem value="Lemon" />
        <SelectItem value="Orange" />
      </SelectPopover>
    </div>
  );
}
