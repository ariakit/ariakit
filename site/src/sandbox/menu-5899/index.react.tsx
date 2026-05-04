import * as Ariakit from "@ariakit/react";

export default function Example() {
  const menu = Ariakit.useMenuStore();

  return (
    <Ariakit.MenuProvider store={menu}>
      <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
      <Ariakit.Menu
        autoFocusOnShow={() => menu.getState().initialFocus !== "container"}
        gutter={8}
      >
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Share</Ariakit.MenuItem>
        <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
        <Ariakit.MenuSeparator />
        <Ariakit.MenuItem>Report</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}
