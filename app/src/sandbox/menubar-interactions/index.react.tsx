import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuProvider,
  MenuSeparator,
} from "./menu.react.tsx";

export default function Example() {
  return (
    <>
      <MenuInteractions />
      <MenuControls />
    </>
  );
}

function MenuInteractions() {
  return (
    <Ariakit.Menubar className="menubar">
      <MenuProvider>
        <MenuItem className="menubar-item" render={<MenuButton />}>
          File
        </MenuItem>
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
        <MenuItem className="menubar-item" render={<MenuButton />}>
          Edit
        </MenuItem>
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
        <MenuItem className="menubar-item" render={<MenuButton />}>
          View
        </MenuItem>
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
    </Ariakit.Menubar>
  );
}

function ToolsMenu(props: Ariakit.MenuProviderProps) {
  return (
    <Ariakit.MenuProvider {...props}>
      <Ariakit.MenuItem render={<Ariakit.MenuButton />}>Tools</Ariakit.MenuItem>
      <Ariakit.Menu className="menu" gutter={4}>
        <Ariakit.MenuItem className="menu-item">New document</Ariakit.MenuItem>
        <input aria-label="Search" defaultValue="abc" className="input" />
        <Ariakit.MenuItem
          aria-label="Rename"
          hideOnClick={false}
          render={<input defaultValue="abc" className="input" />}
        />
        <Ariakit.MenuItem hideOnClick={false}>
          <input
            aria-label="Nested search"
            defaultValue="abc"
            className="input"
          />
        </Ariakit.MenuItem>
        <a href="#help" tabIndex={0}>
          Help
        </a>
        <button type="button" tabIndex={0}>
          Action
        </button>
        <Ariakit.MenuProvider>
          <Ariakit.MenuItem render={<Ariakit.MenuButton />}>
            More options
          </Ariakit.MenuItem>
          <Ariakit.Menu className="menu" gutter={4}>
            <Ariakit.MenuItem>Archive</Ariakit.MenuItem>
            <input aria-label="Filter" defaultValue="abc" className="input" />
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

function MenuControls() {
  const [vertical, setVertical] = useState(false);
  const placement = vertical ? "right-start" : "bottom-start";
  return (
    <div className="menu-controls">
      <label>
        <input
          type="checkbox"
          checked={vertical}
          onChange={(event) => setVertical(event.currentTarget.checked)}
        />
        Vertical menubar
      </label>
      <Ariakit.Menubar
        className="menubar"
        orientation={vertical ? "vertical" : "horizontal"}
      >
        <ToolsMenu placement={placement} />
        <Ariakit.MenuProvider placement={placement}>
          <Ariakit.MenuItem render={<Ariakit.MenuButton />}>
            Format
          </Ariakit.MenuItem>
          <Ariakit.Menu className="menu" gutter={4}>
            <Ariakit.MenuItem className="menu-item">
              Clear formatting
            </Ariakit.MenuItem>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
        <Ariakit.ComboboxProvider defaultValue="abc">
          <Ariakit.MenuProvider placement={placement}>
            <Ariakit.MenuItem render={<Ariakit.MenuButton />}>
              Insert
            </Ariakit.MenuItem>
            <Ariakit.Menu className="menu" gutter={4}>
              <Ariakit.Combobox aria-label="Search blocks" className="input" />
              <Ariakit.ComboboxList>
                <Ariakit.ComboboxItem value="Paragraph" className="menu-item" />
              </Ariakit.ComboboxList>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
        </Ariakit.ComboboxProvider>
      </Ariakit.Menubar>
    </div>
  );
}
