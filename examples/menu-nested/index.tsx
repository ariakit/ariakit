import { Menu, MenuItem } from "./menu.jsx";
import "./style.css";

export default function Example() {
  return (
    <Menu label="Edit">
      <MenuItem label="Undo" />
      <MenuItem label="Redo" />
      <Menu label="Find">
        <MenuItem label="Search the Web..." />
        <MenuItem label="Find..." />
        <MenuItem label="Find Next" />
        <MenuItem label="Find Previous" />
      </Menu>
      <Menu label="Speech">
        <MenuItem label="Start Speaking" />
        <MenuItem disabled label="Stop Speaking" />
      </Menu>
    </Menu>
  );
}
