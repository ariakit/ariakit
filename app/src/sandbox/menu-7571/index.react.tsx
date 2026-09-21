import * as Ariakit from "@ariakit/react";

const menuStyle = {
  background: "white",
  color: "black",
  border: "1px solid",
  padding: 8,
};

function BlogsSubmenu() {
  // Recreate the store with the parent menu so earlier moves are not inherited.
  const submenu = Ariakit.useMenuStore();
  return (
    <Ariakit.MenuProvider store={submenu} placement="right-start">
      <Ariakit.MenuButton render={<Ariakit.MenuItem />}>
        Blogs
      </Ariakit.MenuButton>
      <Ariakit.Menu unmountOnHide portal style={menuStyle}>
        <Ariakit.MenuItem>Alpha</Ariakit.MenuItem>
        <Ariakit.MenuItem>Bravo</Ariakit.MenuItem>
        <Ariakit.MenuItem>Charlie</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  return (
    <main>
      <div style={{ height: 3000 }}>Scroll down to the menu.</div>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Menu</Ariakit.MenuButton>
        <Ariakit.Menu unmountOnHide style={menuStyle}>
          <BlogsSubmenu />
          <Ariakit.MenuItem>Settings</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <div style={{ height: 3000 }} />
    </main>
  );
}
