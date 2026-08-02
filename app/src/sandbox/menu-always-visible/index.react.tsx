import * as Ariakit from "@ariakit/react";

/**
 * An `alwaysVisible` menu is shown even while its store is closed, so it is
 * never positioned and its items are navigable without the menu ever opening.
 * DOM focus is the accessibility cursor for a roving tabindex composite like
 * this one, so it has to follow the active item rather than waiting for a popup
 * lifecycle that doesn't happen here.
 */
export default function Example() {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
      <Ariakit.Menu alwaysVisible>
        <Ariakit.MenuItem>Save</Ariakit.MenuItem>
        <Ariakit.MenuItem>Open</Ariakit.MenuItem>
        <Ariakit.MenuItem>Close</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}
