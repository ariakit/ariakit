import { MenuItemCheck, MenuItemCheckbox } from "ariakit";
import { Menu, MenuItem, MenuSeparator } from "./menu";
import "./style.css";

export default function Example() {
  return (
    <Menu label="Edit">
      <MenuItem
        label={
          <>
            <span className="label">Undo</span>
            <span className="shortcuts">⌘ Z</span>
          </>
        }
      />
      <MenuItem
        label={
          <>
            <span className="label">Redo</span>
            <span className="shortcuts">⇧ ⌘ Z</span>
          </>
        }
      />
      <MenuSeparator className="menu-separator" />
      <Menu label="Find">
        <MenuItem
          label={
            <>
              <span className="label">Search the web...</span>
              <span className="shortcuts">⌥ ⌘ F</span>
            </>
          }
        />
        <MenuSeparator className="menu-separator" />
        <MenuItem
          label={
            <>
              <span className="label">Find...</span>
              <span className="shortcuts">⌘ F</span>
            </>
          }
        />
        <MenuItem
          label={
            <>
              <span className="label">Find Next</span>
              <span className="shortcuts">⌘ G</span>
            </>
          }
        />
        <MenuItem
          label={
            <>
              <span className="label">Find Previous</span>
              <span className="shortcuts">⇧ ⌘ G</span>
            </>
          }
        />
      </Menu>
      <Menu label="Substitutions">
        <MenuItemCheckbox name="show-substitutions" className="menu-item">
          <MenuItemCheck />
          <span className="label">Show Substitutions</span>
        </MenuItemCheckbox>
        <MenuSeparator className="menu-separator" />
        <MenuItemCheckbox name="smart-quotes" disabled className="menu-item">
          <MenuItemCheck />
          <span className="label">Smart Quotes</span>
        </MenuItemCheckbox>
        <MenuItemCheckbox name="smart-dashes" disabled className="menu-item">
          <MenuItemCheck />
          <span className="label">Smart Dashes</span>
        </MenuItemCheckbox>
        <MenuItemCheckbox
          name="text-replacement"
          disabled
          className="menu-item"
        >
          <MenuItemCheck checked />
          <span className="label">Text Replacement</span>
        </MenuItemCheckbox>
      </Menu>
    </Menu>
  );
}
