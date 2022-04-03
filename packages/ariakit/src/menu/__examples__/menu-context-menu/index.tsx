import {
  Menu,
  MenuArrow,
  MenuButton,
  MenuButtonArrow,
  MenuItemCheck,
  MenuItemCheckbox,
  useMenuState,
} from "ariakit/menu";
import "./style.css";

export default function Example() {
  const menu = useMenuState({
    defaultValues: { watching: ["issues"] },
    autoFocusOnShow: true,
  });
  return (
    <div
      onContextMenu={(event) => {
        event.preventDefault();
        menu.setAnchorRect({ x: event.clientX, y: event.clientY });
        menu.show();
      }}
    >
      dsadsa
      <Menu state={menu} modal className="menu">
        <MenuItemCheckbox name="watching" value="issues" className="menu-item">
          <MenuItemCheck />
          Issues
        </MenuItemCheckbox>
        <MenuItemCheckbox
          name="watching"
          value="pull-requests"
          className="menu-item"
        >
          <MenuItemCheck />
          Pull requests
        </MenuItemCheckbox>
        <MenuItemCheckbox
          name="watching"
          value="releases"
          className="menu-item"
        >
          <MenuItemCheck />
          Releases
        </MenuItemCheckbox>
        <MenuItemCheckbox
          name="watching"
          value="discussions"
          className="menu-item"
        >
          <MenuItemCheck />
          Discussions
        </MenuItemCheckbox>
        <MenuItemCheckbox
          name="watching"
          value="security-alerts"
          className="menu-item"
        >
          <MenuItemCheck />
          Security alerts
        </MenuItemCheckbox>
      </Menu>
    </div>
  );
}
