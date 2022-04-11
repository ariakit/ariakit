import { Menu, MenuBar, MenuItem, MenuSeparator } from "./menu";
import "./style.css";

export default function Example() {
  return (
    <MenuBar>
      <Menu label="File">
        <MenuItem label="New Tab" />
        <MenuItem label="New Window" />
        <MenuItem label="Open File" />
        <MenuItem label="Open Location" />
        <MenuSeparator />
        <MenuItem label="Close Window" />
        <MenuItem label="Close Tab" />
        <MenuItem label="Save Page As" />
        <MenuSeparator />
        <Menu label="Share">
          <MenuItem label="Email Link" />
          <MenuItem label="Messages" />
          <MenuItem label="Notes" />
          <MenuItem label="Reminders" />
          <MenuItem label="More..." />
        </Menu>
        <MenuSeparator />
        <MenuItem label="Print" />
      </Menu>
      <Menu label="Edit">
        <MenuItem label="Undo" />
        <MenuItem label="Redo" />
        <MenuSeparator />
        <MenuItem label="Cut" />
        <MenuItem label="Copy" />
        <MenuItem label="Paste" />
        <MenuItem label="Paste and Match Style" />
        <MenuItem label="Delete" />
        <MenuItem label="Select All" />
        <MenuSeparator />
        <Menu label="Find">
          <MenuItem label="Search the Web" />
          <MenuSeparator />
          <MenuItem label="Find" />
          <MenuItem label="Find Next" />
          <MenuItem label="Find Previous" />
          <MenuItem label="Use Selection for Find" />
          <MenuItem disabled label="Jump to Selection" />
        </Menu>
        <Menu label="Spelling and Grammar">
          <MenuItem label="Show Spelling and Grammar" />
          <MenuItem label="Check Document Now" />
        </Menu>
        <Menu label="Substitutions">
          <MenuItem label="Show Substitutions" />
        </Menu>
        <MenuSeparator />
        <MenuItem disabled label="Start Dictation" />
        <MenuItem label="Emoji &amp; Symbols" />
      </Menu>
      <Menu label="View">
        <MenuItem disabled label="Stop" />
        <MenuItem label="Force Reload This Page" />
        <MenuSeparator />
        <MenuItem label="Enter Full Screen" />
        <MenuItem disabled label="Actual Size" />
        <MenuItem label="Zoom In" />
        <MenuItem label="Zoom Out" />
        <MenuSeparator />
        <MenuItem label="Cast" />
        <MenuSeparator />
        <Menu label="Developer">
          <MenuItem label="View Source" />
          <MenuItem label="Developer Tools" />
          <MenuItem label="Inspect Elements" />
          <MenuItem label="JavaScript Console" />
          <MenuItem label="Allow JavaScript from Apple Events" />
        </Menu>
      </Menu>
    </MenuBar>
  );
}
