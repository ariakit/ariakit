import { Menu, MenuItem } from "./menu";
import "./style.css";

export default function Example() {
  return (
    <Menu label="Settings">
      <MenuItem label="New Tab" />
      <MenuItem label="New Window" />
      <Menu label="Bookmarks">
        <MenuItem label="Search the Web..." />
        <MenuItem label="Find..." />
        <MenuItem label="Find Next" />
        <MenuItem label="Find Previous" />
      </Menu>
      <Menu label="History">
        <MenuItem label="Start Speaking" />
        <MenuItem disabled label="Stop Speaking" />
      </Menu>
      <MenuItem label="Downloads" />
      <Menu label="More tools">
        <MenuItem label="Start Speaking" />
        <MenuItem disabled label="Stop Speaking" />
        <Menu label="More tools">
          <MenuItem label="Start Speaking" />
          <MenuItem disabled label="Stop Speaking" />
        </Menu>
      </Menu>
      <Menu label="Help">
        <MenuItem label="Start Speaking" />
        <MenuItem disabled label="Stop Speaking" />
      </Menu>
    </Menu>
  );
}
