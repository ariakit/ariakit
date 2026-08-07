import * as Ariakit from "@ariakit/react";
import { useEffect } from "react";

// The menu is open from the first render, so it has to define its own focus
// without a user gesture and without a prior focus owner to return to.
export default function Example() {
  const menu = Ariakit.useMenuStore({ defaultOpen: true });

  useEffect(() => {
    // Menu inherits Hovercard's `autoFocusOnShow: false`, and only a MenuButton
    // gesture flips it, so a menu that mounts already open never focuses its
    // container.
    // TODO: Remove this, and the store hoist it needs, once
    // https://github.com/ariakit/ariakit/issues/2946 is fixed.
    menu.setAutoFocusOnShow(true);
  }, [menu]);

  return (
    <Ariakit.MenuProvider store={menu}>
      <Ariakit.MenuButton className="button">Actions</Ariakit.MenuButton>
      <Ariakit.Menu gutter={8} className="menu">
        <Ariakit.MenuItem className="menu-item">Rename</Ariakit.MenuItem>
        <Ariakit.MenuItem className="menu-item">Duplicate</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}
