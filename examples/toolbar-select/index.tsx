import "./style.css";
import { useState } from "react";
import * as icons from "./icons.jsx";
import { Select, SelectArrow, SelectItem } from "./select.jsx";
import { Toolbar, ToolbarButton, ToolbarSeparator } from "./toolbar.jsx";

const options = [
  { value: "Align Left", icon: icons.alignLeft },
  { value: "Align Center", icon: icons.alignCenter },
  { value: "Align Right", icon: icons.alignRight },
];

export default function Example() {
  const [value, setValue] = useState("Align Left");
  const selectedIcon = options.find((option) => option.value === value)?.icon;
  return (
    <Toolbar>
      <ToolbarButton>{icons.bold} Bold</ToolbarButton>
      <ToolbarButton>{icons.italic} Italic</ToolbarButton>
      <ToolbarButton>{icons.underline} Underline</ToolbarButton>
      <ToolbarSeparator />
      <Select
        aria-label="Text alignment"
        value={value}
        onChange={setValue}
        render={
          <ToolbarButton>
            {selectedIcon} {value} <SelectArrow />
          </ToolbarButton>
        }
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.icon} {option.value}
          </SelectItem>
        ))}
      </Select>
    </Toolbar>
  );
}
