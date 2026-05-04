import * as Ariakit from "@ariakit/react";

function MenuItems() {
  return (
    <>
      <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
      <Ariakit.MenuItem>Share</Ariakit.MenuItem>
      <Ariakit.MenuItem disabled>Delete</Ariakit.MenuItem>
      <Ariakit.MenuSeparator />
      <Ariakit.MenuItem>Report</Ariakit.MenuItem>
    </>
  );
}

export default function Example() {
  return (
    <>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Boolean</Ariakit.MenuButton>
        <Ariakit.Menu autoFocusOnShow={false} gutter={8}>
          <MenuItems />
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Callback</Ariakit.MenuButton>
        <Ariakit.Menu
          autoFocusOnShow={(element) => {
            element?.setAttribute("data-autofocus-on-show-callback", "true");
            return false;
          }}
          gutter={8}
        >
          <MenuItems />
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </>
  );
}
