import {
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuItem,
  MenuSeparator,
  useMenuStore,
} from "ariakit/menu/store";
import "./style.css";

export default function Example() {
  const menu = useMenuStore({ gutter: 8 });
  return (
    <>
      <MenuButton store={menu} className="button">
        Actions
        <MenuButtonArrow />
      </MenuButton>
      <Menu store={menu} className="menu">
        <MenuItem className="menu-item" onClick={() => alert("Edit")}>
          Edit
        </MenuItem>
        <MenuItem className="menu-item">Share</MenuItem>
        <MenuItem className="menu-item" disabled>
          Delete
        </MenuItem>
        <MenuSeparator className="separator" />
        <MenuItem className="menu-item">Report</MenuItem>
      </Menu>
    </>
  );
}
