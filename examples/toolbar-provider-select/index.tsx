import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";
import { SelectProvider } from "@ariakit/react-core/select/select-provider";
import { ToolbarProvider } from "@ariakit/react-core/toolbar/toolbar-provider";
import * as icons from "./icons.js";

const options = [
  { value: "Align Left", icon: icons.alignLeft },
  { value: "Align Center", icon: icons.alignCenter },
  { value: "Align Right", icon: icons.alignRight },
];

export default function Example() {
  const [value, setValue] = useState("Align Left");
  const selectedIcon = options.find((option) => option.value === value)?.icon;
  return (
    <ToolbarProvider>
      <Ariakit.Toolbar className="toolbar">
        <Ariakit.ToolbarItem className="button secondary">
          {icons.bold} Bold
        </Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem className="button secondary">
          {icons.italic} Italic
        </Ariakit.ToolbarItem>
        <Ariakit.ToolbarItem className="button secondary">
          {icons.underline} Underline
        </Ariakit.ToolbarItem>
        <Ariakit.ToolbarSeparator className="separator" />
        <SelectProvider value={value} setValue={setValue}>
          <Ariakit.Select
            aria-label="Text alignment"
            className="button secondary"
            render={<Ariakit.ToolbarItem />}
          >
            {selectedIcon} {value} <Ariakit.SelectArrow />
          </Ariakit.Select>
          <Ariakit.SelectPopover gutter={4} className="popover">
            {options.map((option) => (
              <Ariakit.SelectItem
                key={option.value}
                value={option.value}
                className="select-item"
              >
                {option.icon} {option.value}
              </Ariakit.SelectItem>
            ))}
          </Ariakit.SelectPopover>
        </SelectProvider>
      </Ariakit.Toolbar>
    </ToolbarProvider>
  );
}
