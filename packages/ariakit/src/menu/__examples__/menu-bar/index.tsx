import { MenuGroup, MenuGroupLabel } from "ariakit";
import { CgMoreO } from "react-icons/cg";
import { FcGoogle } from "react-icons/fc";
import { GoMarkGithub } from "react-icons/go";
import { MdHistory } from "react-icons/md";
import {
  Menu,
  MenuBar,
  MenuInput,
  MenuItem,
  MenuItemCheckbox,
  MenuSeparator,
} from "./menu";
import "./style.css";

export default function Example() {
  return (
    <MenuBar id="lol">
      <Menu label="File">
        <MenuItem shortcuts="⌘ T">New Tab</MenuItem>
        <MenuItem shortcuts="⌘ N">New Window</MenuItem>
        <MenuItem shortcuts="⌘ O">Open File...</MenuItem>
        <MenuItem shortcuts="⌘ L">Open Location...</MenuItem>
        <MenuSeparator />
        <MenuItem shortcuts="⇧ ⌘ W">Close Window</MenuItem>
        <MenuItem shortcuts="⌘ W">Close Tab</MenuItem>
        <MenuItem shortcuts="⌘ S">Save Page As...</MenuItem>
        <MenuSeparator />
        <Menu label="Share">
          <MenuItem
            shortcuts="⇧ ⌘ I"
            icon={
              <img
                width="16"
                height="16"
                src="https://cdn.jim-nielsen.com/macos/512/mail-2021-05-25.png"
                srcSet="https://cdn.jim-nielsen.com/macos/1024/mail-2021-05-25.png 2x"
              />
            }
          >
            Email Link
          </MenuItem>
          <MenuItem
            icon={
              <img
                width="16"
                height="16"
                src="https://cdn.jim-nielsen.com/macos/512/messages-2021-05-25.png"
                srcSet="https://cdn.jim-nielsen.com/macos/1024/messages-2021-05-25.png 2x"
              ></img>
            }
          >
            Messages
          </MenuItem>
          <MenuItem
            icon={
              <img
                width="16"
                height="16"
                src="https://cdn.jim-nielsen.com/macos/512/notes-2021-05-25.png"
                srcSet="https://cdn.jim-nielsen.com/macos/1024/notes-2021-05-25.png 2x"
              ></img>
            }
          >
            Notes
          </MenuItem>
          <MenuItem
            icon={
              <img
                width="16"
                height="16"
                src="https://cdn.jim-nielsen.com/macos/512/reminders-2021-05-28.png"
                srcSet="https://cdn.jim-nielsen.com/macos/1024/reminders-2021-05-28.png 2x"
              ></img>
            }
          >
            Reminders
          </MenuItem>
          <MenuItem icon={<CgMoreO />}>More...</MenuItem>
        </Menu>
        <MenuSeparator />
        <MenuItem shortcuts="⌘ P">Print...</MenuItem>
      </Menu>
      <Menu label="Edit">
        <MenuItem shortcuts="⌘ Z">Undo</MenuItem>
        <MenuItem shortcuts="⇧ ⌘ Z">Redo</MenuItem>
        <MenuSeparator />
        <MenuItem shortcuts="⌘ X">Cut</MenuItem>
        <MenuItem shortcuts="⌘ C">Copy</MenuItem>
        <MenuItem shortcuts="⌘ V">Paste</MenuItem>
        <MenuItem shortcuts="⇧ ⌘ V">Paste and Match Style</MenuItem>
        <MenuItem>Delete</MenuItem>
        <MenuItem shortcuts="⌘ A">Select All</MenuItem>
        <MenuSeparator />
        <Menu label="Find">
          <MenuItem shortcuts="⌥ ⌘ F">Search the Web...</MenuItem>
          <MenuSeparator />
          <MenuItem shortcuts="⌘ F">Find...</MenuItem>
          <MenuItem shortcuts="⌘ G">Find Next</MenuItem>
          <MenuItem shortcuts="⇧ ⌘ C">Find Previous</MenuItem>
          <MenuItem shortcuts="⌘ E">Use Selection for Find</MenuItem>
          <MenuItem shortcuts="⌘ J" disabled>
            Jump to Selection
          </MenuItem>
        </Menu>
        <Menu label="Spelling and Grammar" hasCheckbox>
          <MenuItem shortcuts="⌘ :">Show Spelling and Grammar</MenuItem>
          <MenuItem shortcuts="⌘ ;">Check Document Now</MenuItem>
          <MenuItemCheckbox checked>
            Check Spelling While Typing
          </MenuItemCheckbox>
          <MenuItemCheckbox disabled>
            Check Grammar While Spelling
          </MenuItemCheckbox>
        </Menu>
        <Menu label="Substitutions" hasCheckbox>
          <MenuItem>Show Substitutions</MenuItem>
          <MenuSeparator />
          <MenuItemCheckbox disabled>Smart Quotes</MenuItemCheckbox>
          <MenuItemCheckbox disabled>Smart Dashes</MenuItemCheckbox>
          <MenuItemCheckbox checked disabled>
            Text Replacement
          </MenuItemCheckbox>
        </Menu>
        <MenuSeparator />
        <MenuItem disabled>Start Dictation</MenuItem>
        <MenuItem>Emoji &amp; Symbols</MenuItem>
      </Menu>
      <Menu label="View" hasCheckbox>
        <MenuItemCheckbox shortcuts="⇧ ⌘ B">
          Always Show Bookmarks Bar
        </MenuItemCheckbox>
        <MenuItemCheckbox shortcuts="⇧ ⌘ F" checked>
          Always Show Toolbar in Full Screen
        </MenuItemCheckbox>
        <MenuItemCheckbox checked>Always Show Full URLs</MenuItemCheckbox>
        <MenuSeparator />
        <MenuItem shortcuts="⌘ ." disabled>
          Stop
        </MenuItem>
        <MenuItem shortcuts="⌘ R">Force Reload This Page</MenuItem>
        <MenuSeparator />
        <MenuItem>Enter Full Screen</MenuItem>
        <MenuItem shortcuts="⌘ 0" disabled>
          Actual Size
        </MenuItem>
        <MenuItem shortcuts="⌘ =">Zoom In</MenuItem>
        <MenuItem shortcuts="⌘ -">Zoom Out</MenuItem>
        <MenuSeparator />
        <MenuItem>Cast...</MenuItem>
        <MenuSeparator />
        <Menu label="Developer">
          <MenuItem shortcuts="⌥ ⌘ U">View Source</MenuItem>
          <MenuItem shortcuts="⌥ ⌘ I">Developer Tools</MenuItem>
          <MenuItem shortcuts="⌥ ⌘ C">Inspect Elements</MenuItem>
          <MenuItem shortcuts="⌥ ⌘ J">JavaScript Console</MenuItem>
          <MenuItem>Allow JavaScript from Apple Events</MenuItem>
        </Menu>
      </Menu>
      <Menu label="History">
        <MenuItem shortcuts="⇧ ⌘ H">Home</MenuItem>
        <MenuItem shortcuts="⌘ [">Back</MenuItem>
        <MenuItem shortcuts="⌘ ]" disabled>
          Forward
        </MenuItem>
        <MenuSeparator />
        <MenuGroup className="menu-group">
          <MenuGroupLabel className="group-label">
            Recently Closed
          </MenuGroupLabel>
          <MenuItem icon={<FcGoogle />}>
            How to build a menu bar - Google Search
          </MenuItem>
          <MenuItem
            icon={
              <img
                width="16"
                height="16"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/1024px-Stack_Overflow_icon.svg.png?20190716190036"
              />
            }
          >
            Create a menu bar with JavaScript - Stack Overflow
          </MenuItem>
          <Menu label="3 Tabs">
            <MenuItem>Restore All Tabs</MenuItem>
            <MenuSeparator />
            <MenuItem icon={<GoMarkGithub />}>Notifications</MenuItem>
            <MenuItem icon={<GoMarkGithub />}>
              Pull requests - ariakit/ariakit
            </MenuItem>
            <MenuItem icon={<GoMarkGithub />}>
              feat: Add `Select` component - ariakit/ariakit
            </MenuItem>
          </Menu>
          <MenuItem
            icon={
              <img
                src="https://img.icons8.com/color/344/twitter--v1.png"
                width="16"
                height={16}
              />
            }
          >
            Notifications / Twitter
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup className="menu-group">
          <MenuGroupLabel className="group-label">
            Recently Visited
          </MenuGroupLabel>
          <MenuItem icon={<FcGoogle />}>
            MacOS menu bar - Google Search
          </MenuItem>
          <MenuItem icon={<GoMarkGithub />}>Notifications</MenuItem>
          <MenuItem icon={<GoMarkGithub />}>
            Pull requests - ariakit/ariakit
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem icon={<MdHistory />} shortcuts="⌘ Y">
          Show Full History
        </MenuItem>
      </Menu>
      <Menu label="Help">
        <MenuInput placeholder="Search" />
        <MenuItem shortcuts="⌥ ⇧ ⌘ I">Report an Issue...</MenuItem>
        <MenuItem>Google Chrome Help</MenuItem>
      </Menu>
    </MenuBar>
  );
}
