import * as Ariakit from "@ariakit/react";

// The menu is open from the first render, so it has to define its own focus
// without a user gesture and without a prior focus owner to return to.
export default function Example() {
  return (
    <Ariakit.MenuProvider defaultOpen>
      <Ariakit.MenuButton className="button">Actions</Ariakit.MenuButton>
      <Ariakit.Menu gutter={8} className="menu">
        <Ariakit.MenuItem className="menu-item">Rename</Ariakit.MenuItem>
        <Ariakit.MenuItem className="menu-item">Duplicate</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}
