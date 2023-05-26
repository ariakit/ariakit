import { useState } from "react";
import { Menu, MenuItem } from "./menu.jsx";
import { Select, SelectItem } from "./select.jsx";
import "./style.css";

export default function Example() {
  const [showSelect, setShowSelect] = useState(false);
  return (
    <>
      <Menu label="Filters">
        <MenuItem>Status</MenuItem>
        <MenuItem onClick={() => setShowSelect(true)}>Source language</MenuItem>
      </Menu>
      {showSelect && (
        // TODO: aria-expanded
        <Select
          defaultOpen
          onToggle={(open) => console.log("toggle", open)}
          defaultValue="French"
          render={(props) => (
            <button {...props}>Language is {props.children}</button>
          )}
        >
          <SelectItem value="English" />
          <SelectItem value="French" />
          <SelectItem value="German" />
        </Select>
      )}
    </>
  );
}
