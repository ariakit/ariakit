import {
  Menu,
  MenuArrow,
  MenuButton,
  MenuButtonArrow,
  MenuItemCheck,
  MenuItemCheckbox,
  useMenuStore,
} from "ariakit/menu/store";
import "./style.css";

export default function Example() {
  const menu = useMenuStore({
    defaultValues: { watching: ["issues"] },
  });
  const buttonLabel = menu.useState((state) =>
    !!state.values.watching.length ? "Unwatch" : "Watch"
  );
  return (
    <>
      <MenuButton store={menu} className="button">
        {buttonLabel}
        <MenuButtonArrow />
      </MenuButton>
      <Menu store={menu} className="menu">
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
