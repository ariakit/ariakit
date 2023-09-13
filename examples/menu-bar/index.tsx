import "./style.css";
import {
  Menu,
  MenuBar,
  MenuButton,
  MenuItem,
  MenuProvider,
  MenuSeparator,
} from "./menu.jsx";

export default function Example() {
  return (
    <MenuBar>
      <MenuProvider>
        <MenuItem render={<MenuButton />}>File</MenuItem>
        <Menu>
          <MenuItem>New Tab</MenuItem>
          <MenuItem>New Window</MenuItem>
          <MenuItem>Open File</MenuItem>
          <MenuItem>Open Location</MenuItem>
          <MenuSeparator />
          <MenuItem>Close Window</MenuItem>
          <MenuItem>Close Tab</MenuItem>
          <MenuItem>Save Page As</MenuItem>
          <MenuSeparator />
          <MenuProvider>
            <MenuItem render={<MenuButton />}>Share</MenuItem>
            <Menu>
              <MenuItem>Email Link</MenuItem>
              <MenuItem>Messages</MenuItem>
              <MenuItem>Notes</MenuItem>
              <MenuItem>Reminders</MenuItem>
              <MenuItem>More...</MenuItem>
            </Menu>
          </MenuProvider>
          <MenuItem>Print</MenuItem>
        </Menu>
      </MenuProvider>
      <MenuProvider>
        <MenuItem render={<MenuButton />}>Edit</MenuItem>
        <Menu>
          <MenuItem>Undo</MenuItem>
          <MenuItem>Redo</MenuItem>
          <MenuSeparator />
          <MenuItem>Cut</MenuItem>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
          <MenuItem>Paste and Match Style</MenuItem>
          <MenuItem>Delete</MenuItem>
          <MenuItem>Select All</MenuItem>
          <MenuSeparator />
          <MenuProvider>
            <MenuItem render={<MenuButton />}>Find</MenuItem>
            <Menu>
              <MenuItem>Search the Web</MenuItem>
              <MenuSeparator />
              <MenuItem>Find</MenuItem>
              <MenuItem>Find Next</MenuItem>
              <MenuItem>Find Previous</MenuItem>
              <MenuItem>Use Selection for Find</MenuItem>
              <MenuItem disabled>Jump to Selection</MenuItem>
            </Menu>
          </MenuProvider>
          <MenuProvider>
            <MenuItem render={<MenuButton />}>Spelling and Grammar</MenuItem>
            <Menu>
              <MenuItem>Show Spelling and Grammar</MenuItem>
              <MenuItem>Check Document Now</MenuItem>
            </Menu>
          </MenuProvider>
          <MenuProvider>
            <MenuItem render={<MenuButton />}>Substitutions</MenuItem>
            <Menu>
              <MenuItem>Show Substitutions</MenuItem>
            </Menu>
          </MenuProvider>
          <MenuSeparator />
          <MenuItem disabled>Start Dictation</MenuItem>
          <MenuItem>Emoji &amp; Symbols</MenuItem>
        </Menu>
      </MenuProvider>
      <MenuProvider>
        <MenuItem render={<MenuButton />}>View</MenuItem>
        <Menu>
          <MenuItem disabled>Stop</MenuItem>
          <MenuItem>Force Reload This Page</MenuItem>
          <MenuSeparator />
          <MenuItem>Enter Full Screen</MenuItem>
          <MenuItem disabled>Actual Size</MenuItem>
          <MenuItem>Zoom In</MenuItem>
          <MenuItem>Zoom Out</MenuItem>
          <MenuSeparator />
          <MenuItem>Cast</MenuItem>
          <MenuSeparator />
          <MenuProvider>
            <MenuItem render={<MenuButton />}>Developer</MenuItem>
            <Menu>
              <MenuItem>View Source</MenuItem>
              <MenuItem>Developer Tools</MenuItem>
              <MenuItem>Inspect Elements</MenuItem>
              <MenuItem>JavaScript Console</MenuItem>
              <MenuItem>Allow JavaScript from Apple Events</MenuItem>
            </Menu>
          </MenuProvider>
        </Menu>
      </MenuProvider>
    </MenuBar>
  );
}
