import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import Square from "./square.tsx";
import "./style.css";

export default function Example() {
  const [value, setValue] = useState("Center");
  const combobox = Ariakit.useComboboxStore({
    selectedValue: value,
    setSelectedValue: setValue,
  });

  const renderItem = (value: string) => (
    <Ariakit.ComboboxItem
      role="gridcell"
      value={value}
      className="select-item"
      focusOnHover={(event) => {
        // When the mouse leaves the item, we don't want to unset the active
        // item.
        if (event.type === "mouseleave") return false;
        // By default, hovering over an item doesn't focus it, nor does it set
        // the value. So we need to manually "move" to the item so it gets
        // focused and the value is set.
        combobox.move(event.currentTarget.id);
        return true;
      }}
    >
      <Ariakit.VisuallyHidden>{value}</Ariakit.VisuallyHidden>
    </Ariakit.ComboboxItem>
  );

  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider
        store={combobox}
        placement="bottom"
        selectOnMove
      >
        <Ariakit.ComboboxSelectLabel>Position</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect showOnKeyDown={false} className="button">
          <Square value={value} />
          {value}
          <Ariakit.ComboboxSelectArrow />
        </Ariakit.ComboboxSelect>
        <Ariakit.ComboboxPopover role="grid" className="popover">
          <Ariakit.PopoverArrow className="arrow" />
          <Ariakit.ComboboxRow className="row">
            {renderItem("Top Left")}
            {renderItem("Top Center")}
            {renderItem("Top Right")}
          </Ariakit.ComboboxRow>
          <Ariakit.ComboboxRow className="row">
            {renderItem("Center Left")}
            {renderItem("Center")}
            {renderItem("Center Right")}
          </Ariakit.ComboboxRow>
          <Ariakit.ComboboxRow className="row">
            {renderItem("Bottom Left")}
            {renderItem("Bottom Center")}
            {renderItem("Bottom Right")}
          </Ariakit.ComboboxRow>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
