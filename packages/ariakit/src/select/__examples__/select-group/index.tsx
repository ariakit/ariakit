import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectLabel,
  SelectPopover,
  SelectSeparator,
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
      <SelectLabel store={select}>Favorite food</SelectLabel>
      <Select store={select} className="select" />
      <SelectPopover store={select} className="popover">
        <SelectGroup className="group">
          <SelectGroupLabel className="group-label">
            Fruits &amp; Vegetables
          </SelectGroupLabel>
          <SelectItem
            // Enables scroll on key down so pressing ArrowUp will scroll up and
            // reveals the group label.
            preventScrollOnKeyDown={false}
            className="select-item"
            value="Apple"
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
