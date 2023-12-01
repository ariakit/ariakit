import "./style.css";
import { Menu, MenuItem } from "./menu.jsx";

export default function Example() {
  return (
    <Menu label="Edit">
      <MenuItem>Undo</MenuItem>
      <MenuItem>Redo</MenuItem>
      <Menu label="Find" onSearch={console.log}>
        <MenuItem>Search the Web...</MenuItem>
        <MenuItem>Find...</MenuItem>
        <MenuItem>Find Next</MenuItem>
        <MenuItem>Find Previous</MenuItem>
      </Menu>
      <Menu label="Speech">
        <MenuItem>Start Speaking</MenuItem>
        <MenuItem disabled>Stop Speaking</MenuItem>
      </Menu>
    </Menu>
  );
}
