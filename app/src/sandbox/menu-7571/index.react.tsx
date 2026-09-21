import * as Ariakit from "@ariakit/react";

const menuStyle = {
  background: "white",
  color: "black",
  border: "1px solid",
  padding: 8,
};

export default function Example() {
  // The submenu store survives each mount of the parent menu's content.
  const submenu = Ariakit.useMenuStore();

  return (
    <main>
      <div style={{ height: 3000 }}>Scroll down to the menu.</div>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Menu</Ariakit.MenuButton>
        <Ariakit.Menu unmountOnHide style={menuStyle}>
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
          <Ariakit.MenuItem>Settings</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <div style={{ height: 3000 }} />
    </main>
  );
}
