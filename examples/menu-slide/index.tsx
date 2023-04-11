import { Menu, MenuGroup, MenuItem, MenuSeparator } from "./menu.js";
import "./style.css";

export default function Example() {
  return (
    <Menu label="Options">
      <MenuItem label="New Tab" />
      <MenuItem label="New Window" />
      <MenuSeparator />
      <Menu label="Bookmarks">
        <MenuItem label="Bookmark current tab" />
        <MenuItem label="Search bookmarks" />
        <MenuItem label="Show bookmarks toolbar" />
        <MenuSeparator />
        <MenuGroup label="Recent bookmarks">
          <MenuItem label="Getting Started" />
          <MenuItem label="Get Involved" />
          <MenuItem label="Get Help" />
          <MenuItem label="About Us" />
        </MenuGroup>
      </Menu>
      <Menu label="History">
        <Menu label="Recently closed tabs">
          <MenuItem label="Getting Started" />
          <MenuItem label="Get Involved" />
          <MenuItem label="Get Help" />
          <MenuItem label="About Us" />
        </Menu>
        <Menu label="Recently closed windows">
          <MenuItem label="Getting Started" />
          <MenuItem label="Get Involved" />
          <MenuItem label="Get Help" />
          <MenuItem label="About Us" />
        </Menu>
        <MenuItem label="Restore previous session" />
        <MenuSeparator />
        <MenuGroup label="Recent history">
          <MenuItem label="Getting Started" />
          <MenuItem label="Get Involved" />
          <MenuItem label="Get Help" />
          <MenuItem label="About Us" />
        </MenuGroup>
      </Menu>
      <MenuItem label="Downloads" />
      <MenuItem label="Passwords" />
      <MenuSeparator />
      <Menu label="More tools">
        <MenuItem label="Customize toolbar..." />
        <MenuSeparator />
        <MenuGroup label="Browser tools">
          <MenuItem label="Web Developer Tools" />
          <MenuItem label="Task Manager" />
          <MenuItem label="Remote Debugging" />
          <MenuItem label="Browser Console" />
          <MenuItem label="Responsive Design Mode" />
          <MenuItem label="Eyedropper" />
          <MenuItem label="Page Source" />
          <MenuItem label="Extensions for developers" />
        </MenuGroup>
      </Menu>
      <Menu label="Help">
        <MenuItem label="Get help" />
        <MenuItem label="Share ideas and feedback..." />
        <MenuItem label="Troubleshoot Mode..." />
        <MenuItem label="More troubleshooting information" />
        <MenuItem label="Report deceptive site..." />
      </Menu>
    </Menu>
  );
}
