import "./style.css";
import { Menu, MenuItem } from "./menu.jsx";

export default function Example() {
  return (
    <Menu label="Actions" combobox={<input placeholder="Search actions..." />}>
      <MenuItem>Ask AI</MenuItem>
      <MenuItem>Delete</MenuItem>
      <MenuItem>Duplicate</MenuItem>
      <Menu label="Turn into">
        <MenuItem>Search the Web...</MenuItem>
        <MenuItem>Find...</MenuItem>
        <MenuItem>Find Next</MenuItem>
        <MenuItem>Find Previous</MenuItem>
      </Menu>
      <Menu
        label="Turn into page in"
        combobox={<input placeholder="Search page to add in..." />}
      >
        <MenuItem>Private pages</MenuItem>
        <MenuItem>Quick Note</MenuItem>
        <MenuItem>Recipes</MenuItem>
        <MenuItem>Personal Home</MenuItem>
      </Menu>
    </Menu>
  );
}
