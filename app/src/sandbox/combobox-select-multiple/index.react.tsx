import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import list from "./list.ts";

function renderValue(value: string[]) {
  if (value.length === 0) return "No food selected";
  if (value.length === 1) return value[0];
  return `${value.length} food selected`;
}

export default function Example() {
  const [value, setValue] = useState(["Apple", "Cake"]);
  return (
    <Ariakit.ComboboxProvider selectedValue={value} setSelectedValue={setValue}>
      <Ariakit.ComboboxSelectLabel>Favorite food</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect>
        {renderValue(value)}
        <Ariakit.ComboboxSelectArrow />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover gutter={4} sameWidth unmountOnHide>
        {list.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value}>
            <Ariakit.ComboboxItemCheck />
            {value}
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
