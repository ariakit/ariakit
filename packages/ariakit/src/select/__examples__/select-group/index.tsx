import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectLabel,
  SelectPopover,
  SelectSeparator,
  useSelectState,
} from "ariakit/select";
import "./style.css";

export default function Example() {
  const select = useSelectState({
    defaultValue: "Apple",
    sameWidth: true,
    gutter: 4,
  });
  return (
    <div className="wrapper">
      <SelectLabel state={select}>Favorite food</SelectLabel>
      <Select state={select} className="select" />
      <SelectPopover state={select} className="popover">
        <SelectGroup className="group">
          <SelectGroupLabel className="group-label">
            Fruits &amp; Vegetables
          </SelectGroupLabel>
          <SelectItem
            className="select-item"
            value="Apple"
            preventScrollOnKeyDown={false}
          />
          <SelectItem className="select-item" value="Banana" />
          <SelectItem className="select-item" value="Grape" />
          <SelectItem className="select-item" value="Orange" />
        </SelectGroup>
        <SelectSeparator className="separator" />
        <SelectGroup className="group">
          <SelectGroupLabel className="group-label">Dairy</SelectGroupLabel>
          <SelectItem className="select-item" value="Milk" />
          <SelectItem className="select-item" value="Cheese" />
          <SelectItem className="select-item" value="Yogurt" />
        </SelectGroup>
        <SelectSeparator className="separator" />
        <SelectGroup className="group">
          <SelectGroupLabel className="group-label">Beverages</SelectGroupLabel>
          <SelectItem className="select-item" value="Water" />
          <SelectItem className="select-item" value="Juice" />
          <SelectItem className="select-item" value="Soda" />
        </SelectGroup>
        <SelectSeparator className="separator" />
        <SelectGroup className="group">
          <SelectGroupLabel className="group-label">Snacks</SelectGroupLabel>
          <SelectItem className="select-item" value="Chips" />
          <SelectItem className="select-item" value="Nuts" />
          <SelectItem className="select-item" value="Candy" />
        </SelectGroup>
      </SelectPopover>
    </div>
  );
}
