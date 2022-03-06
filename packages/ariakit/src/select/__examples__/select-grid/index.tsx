import { PopoverArrow } from "ariakit/popover";
import {
  Select,
  SelectArrow,
  SelectItem,
  SelectLabel,
  SelectPopover,
  SelectRow,
  useSelectState,
} from "ariakit/select";
import { VisuallyHidden } from "ariakit/visually-hidden";
import Icon from "./icon";
import "./style.css";

export default function Example() {
  const select = useSelectState({
    defaultValue: "Center",
    placement: "bottom",
    setValueOnMove: true,
  });

  const renderItem = (value: string) => (
    <SelectItem
      value={value}
      className="select-item"
      focusOnHover={(event) => {
        // When the mouse leaves the item, we don't want to unset the active
        // item.
        if (event.type === "mouseleave") return false;
        // By default,hovering over an item doesn't focus it, nor does it set
        // the value. So we need to manually "move" to the item so it gets
        // focused and the value is set.
        select.move(event.currentTarget.id);
        return true;
      }}
    >
      <VisuallyHidden>{value}</VisuallyHidden>
    </SelectItem>
  );

  return (
    <div className="wrapper">
      <SelectLabel state={select}>Position</SelectLabel>
      <Select state={select} showOnKeyDown={false} className="select">
        <Icon value={select.value} />
        {select.value}
        <SelectArrow />
      </Select>
      <SelectPopover state={select} role="grid" className="popover">
        <PopoverArrow className="arrow" />
        <SelectRow className="row">
          {renderItem("Top Left")}
          {renderItem("Top Center")}
          {renderItem("Top Right")}
        </SelectRow>
        <SelectRow className="row">
          {renderItem("Center Left")}
          {renderItem("Center")}
          {renderItem("Center Right")}
        </SelectRow>
        <SelectRow className="row">
          {renderItem("Bottom Left")}
          {renderItem("Bottom Center")}
          {renderItem("Bottom Right")}
        </SelectRow>
      </SelectPopover>
    </div>
  );
}
