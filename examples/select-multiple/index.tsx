import "./style.css";
import { useState } from "react";
import {
  Select,
  SelectArrow,
  SelectItem,
  SelectItemCheck,
  SelectLabel,
  SelectPopover,
  SelectProvider,
} from "@ariakit/react";
import list from "./list.js";

function renderValue(value: string[]) {
  if (value.length === 0) return "No food selected";
  if (value.length === 1) return value[0];
  return `${value.length} food selected`;
}

export default function Example() {
  const [value, setValue] = useState(["Apple", "Cake"]);
  return (
    <div className="wrapper">
      <SelectProvider value={value} setValue={setValue}>
        <SelectLabel>Favorite food</SelectLabel>
        <Select className="button">
          {renderValue(value)}
          <SelectArrow />
        </Select>
        <SelectPopover gutter={4} sameWidth unmountOnHide className="popover">
          {list.map((value) => (
            <SelectItem key={value} value={value} className="select-item">
              <SelectItemCheck />
              {value}
            </SelectItem>
          ))}
        </SelectPopover>
      </SelectProvider>
    </div>
  );
}
