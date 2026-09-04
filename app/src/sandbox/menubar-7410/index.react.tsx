import * as Ariakit from "@ariakit/react";

const menuStyle = {
  display: "grid",
  padding: 4,
  border: "1px solid",
  background: "white",
  color: "black",
};

// A vertical menubar whose entries open menus, like an application sidebar.
// https://github.com/ariakit/ariakit/issues/7410
export default function Example() {
  return (
    <Ariakit.Menubar
      aria-label="Vertical menubar"
      orientation="vertical"
      style={{ display: "grid", width: 120, gap: 2 }}
    >
      <Ariakit.MenuProvider>
        <Ariakit.MenuItem render={<Ariakit.MenuButton />}>
          File
        </Ariakit.MenuItem>
        <Ariakit.Menu style={menuStyle}>
          <Ariakit.MenuItem>New</Ariakit.MenuItem>
          <Ariakit.MenuItem>Open</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <Ariakit.MenuProvider>
        <Ariakit.MenuItem render={<Ariakit.MenuButton />}>
          Edit
        </Ariakit.MenuItem>
        <Ariakit.Menu style={menuStyle}>
          <Ariakit.MenuItem>Undo</Ariakit.MenuItem>
          <Ariakit.MenuItem>Redo</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </Ariakit.Menubar>
  );
}
