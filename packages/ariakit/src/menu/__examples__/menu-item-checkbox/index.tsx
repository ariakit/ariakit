import {
  Menu,
  MenuArrow,
  MenuButton,
  MenuButtonArrow,
  MenuItemCheck,
  MenuItemCheckbox,
  useMenuState,
} from "ariakit/menu";
import { HiOutlineEye } from "react-icons/hi";
import "./style.css";

export default function Example() {
  const menu = useMenuState({
    defaultValues: { watching: ["issues"] },
  });
  return (
    <>
      <MenuButton state={menu} className="button">
        <HiOutlineEye />
        {!!menu.values.watching.length ? "Unwatch" : "Watch"}
        <MenuButtonArrow />
      </MenuButton>
      <Menu state={menu} className="menu">
        <MenuArrow className="menu-arrow" />
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
    </>
  );
}
