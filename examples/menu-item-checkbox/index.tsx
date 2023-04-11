import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const menu = Ariakit.useMenuStore({
    defaultValues: { watching: ["issues"] },
  });
  const buttonLabel = menu.useState((state) =>
    !!state.values.watching.length ? "Unwatch" : "Watch"
  );
  return (
    <>
      <Ariakit.MenuButton store={menu} className="button">
        {buttonLabel}
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu store={menu} className="menu">
        <Ariakit.MenuArrow className="menu-arrow" />
        <Ariakit.MenuItemCheckbox
          name="watching"
          value="issues"
          className="menu-item"
        >
          <Ariakit.MenuItemCheck />
          Issues
        </Ariakit.MenuItemCheckbox>
        <Ariakit.MenuItemCheckbox
          name="watching"
          value="pull-requests"
          className="menu-item"
        >
          <Ariakit.MenuItemCheck />
          Pull requests
        </Ariakit.MenuItemCheckbox>
        <Ariakit.MenuItemCheckbox
          name="watching"
          value="releases"
          className="menu-item"
        >
          <Ariakit.MenuItemCheck />
          Releases
        </Ariakit.MenuItemCheckbox>
        <Ariakit.MenuItemCheckbox
          name="watching"
          value="discussions"
          className="menu-item"
        >
          <Ariakit.MenuItemCheck />
          Discussions
        </Ariakit.MenuItemCheckbox>
        <Ariakit.MenuItemCheckbox
          name="watching"
          value="security-alerts"
          className="menu-item"
        >
          <Ariakit.MenuItemCheck />
          Security alerts
        </Ariakit.MenuItemCheckbox>
      </Ariakit.Menu>
    </>
  );
}
