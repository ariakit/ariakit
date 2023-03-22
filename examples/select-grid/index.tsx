import * as Ariakit from "@ariakit/react";
import Icon from "./icon.js";
import "./style.css";

export default function Example() {
  const select = Ariakit.useSelectStore({
    defaultValue: "Center",
    placement: "bottom",
    setValueOnMove: true,
  });
  const value = select.useState("value");

  const renderItem = (value: string) => (
    <Ariakit.SelectItem
      value={value}
      className="select-item"
      focusOnHover={(event) => {
        // When the mouse leaves the item, we don't want to unset the active
        // item.
        if (event.type === "mouseleave") return false;
        // By default, hovering over an item doesn't focus it, nor does it set
        // the value. So we need to manually "move" to the item so it gets
        // focused and the value is set.
        select.move(event.currentTarget.id);
        return true;
      }}
    >
      <Ariakit.VisuallyHidden>{value}</Ariakit.VisuallyHidden>
    </Ariakit.SelectItem>
  );

  return (
    <div className="wrapper">
      <Ariakit.SelectLabel store={select}>Position</Ariakit.SelectLabel>
      <Ariakit.Select store={select} showOnKeyDown={false} className="select">
        <Icon value={value} />
        {value}
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      <Ariakit.SelectPopover store={select} role="grid" className="popover">
        <Ariakit.PopoverArrow className="arrow" />
        <Ariakit.SelectRow className="row">
          {renderItem("Top Left")}
          {renderItem("Top Center")}
          {renderItem("Top Right")}
        </Ariakit.SelectRow>
        <Ariakit.SelectRow className="row">
          {renderItem("Center Left")}
          {renderItem("Center")}
          {renderItem("Center Right")}
        </Ariakit.SelectRow>
        <Ariakit.SelectRow className="row">
          {renderItem("Bottom Left")}
          {renderItem("Bottom Center")}
          {renderItem("Bottom Right")}
        </Ariakit.SelectRow>
      </Ariakit.SelectPopover>
    </div>
  );
}
