import "./style.css";
import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectLabel,
  SelectPopover,
  SelectProvider,
  SelectSeparator,
} from "@ariakit/react";

export default function Example() {
  return (
    <div className="wrapper">
      <SelectProvider defaultValue="Apple">
        <SelectLabel>Favorite food</SelectLabel>
        <Select className="button" />
        <SelectPopover gutter={4} sameWidth className="popover">
          <SelectGroup className="group">
            <SelectGroupLabel className="group-label">
              Fruits &amp; Vegetables
            </SelectGroupLabel>
            <SelectItem className="select-item" value="Apple" />
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
            <SelectGroupLabel className="group-label">
              Beverages
            </SelectGroupLabel>
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
      </SelectProvider>
    </div>
  );
}
