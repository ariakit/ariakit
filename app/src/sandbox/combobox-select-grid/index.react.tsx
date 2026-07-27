import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import Square from "./square.react.tsx";

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
      className="size-10"
      focusOnHover={(event) => {
        if (event.type === "mouseleave") return false;
        combobox.move(event.currentTarget.id);
        return true;
      }}
    >
      <Ariakit.VisuallyHidden>{value}</Ariakit.VisuallyHidden>
    </Ariakit.ComboboxItem>
  );

  return (
    <div>
      <Ariakit.ComboboxProvider
        store={combobox}
        placement="bottom"
        selectOnMove
      >
        <Ariakit.ComboboxSelectLabel>Position</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect showOnKeyDown={false}>
          <Square value={value} />
          {value}
          <Ariakit.ComboboxSelectArrow />
        </Ariakit.ComboboxSelect>
        <Ariakit.ComboboxPopover role="grid" className="p-2">
          <Ariakit.PopoverArrow />
          <Ariakit.ComboboxRow>
            {renderItem("Top Left")}
            {renderItem("Top Center")}
            {renderItem("Top Right")}
          </Ariakit.ComboboxRow>
          <Ariakit.ComboboxRow>
            {renderItem("Center Left")}
            {renderItem("Center")}
            {renderItem("Center Right")}
          </Ariakit.ComboboxRow>
          <Ariakit.ComboboxRow>
            {renderItem("Bottom Left")}
            {renderItem("Bottom Center")}
            {renderItem("Bottom Right")}
          </Ariakit.ComboboxRow>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
