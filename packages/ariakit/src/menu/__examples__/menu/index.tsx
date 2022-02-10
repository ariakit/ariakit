import {
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuItem,
  MenuSeparator,
  useMenuState,
} from "ariakit/menu";
import "./style.css";

export default function Example() {
  const menu = useMenuState({ gutter: 8 });
  return (
    <>
      <MenuButton state={menu} className="button">
        Actions
        <MenuButtonArrow />
      </MenuButton>
      <Menu state={menu} className="menu">
        <MenuItem className="menu-item" onClick={() => alert("Edit")}>
          Edit
        </MenuItem>
        <MenuItem className="menu-item">Share</MenuItem>
        <MenuItem className="menu-item" disabled>
          Delete
        </MenuItem>
        <MenuSeparator className="menu-separator" />
        <MenuItem className="menu-item">Report</MenuItem>
      </Menu>
    </>
  );
}
