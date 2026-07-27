import {
  ComboboxItem,
  ComboboxItemCheck,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxSelect,
  ComboboxSelectArrow,
  ComboboxSelectLabel,
} from "@ariakit/react";
import { useState } from "react";
import list from "./list.ts";
import "./style.css";

function renderValue(value: string[]) {
  if (value.length === 0) return "No food selected";
  if (value.length === 1) return value[0];
  return `${value.length} food selected`;
}

export default function Example() {
  const [value, setValue] = useState(["Apple", "Cake"]);
  return (
    <div className="wrapper">
      <ComboboxProvider selectedValue={value} setSelectedValue={setValue}>
        <ComboboxSelectLabel>Favorite food</ComboboxSelectLabel>
        <ComboboxSelect className="button">
          {renderValue(value)}
          <ComboboxSelectArrow />
        </ComboboxSelect>
        <ComboboxPopover gutter={4} sameWidth unmountOnHide className="popover">
          {list.map((value) => (
            <ComboboxItem key={value} value={value} className="select-item">
              <ComboboxItemCheck />
              {value}
            </ComboboxItem>
          ))}
        </ComboboxPopover>
      </ComboboxProvider>
    </div>
  );
}
