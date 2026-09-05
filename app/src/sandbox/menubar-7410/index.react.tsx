import * as Ariakit from "@ariakit/react";

const menuStyle = {
  display: "grid",
  padding: 4,
  border: "1px solid",
  background: "white",
  color: "black",
};

interface MenubarMenuProps extends Ariakit.MenuProviderProps {
  label: string;
}

// A menubar entry that opens a menu. Rendered inside another menu, it becomes
// a submenu.
function MenubarMenu({ label, children, ...props }: MenubarMenuProps) {
  return (
    <Ariakit.MenuProvider {...props}>
      <Ariakit.MenuItem render={<Ariakit.MenuButton />}>
        {label}
      </Ariakit.MenuItem>
      <Ariakit.Menu style={menuStyle}>{children}</Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

// Vertical menubars whose entries open menus, like application sidebars.
// https://github.com/ariakit/ariakit/issues/7410
export default function Example() {
  return (
    <div style={{ display: "flex", gap: 240 }}>
      <Ariakit.Menubar
        aria-label="Vertical menubar"
        orientation="vertical"
        style={{ display: "grid", width: 120, gap: 2 }}
      >
        <MenubarMenu label="File">
          <Ariakit.MenuItem>New</Ariakit.MenuItem>
          <Ariakit.MenuItem>Open</Ariakit.MenuItem>
          <MenubarMenu label="Share">
            <Ariakit.MenuItem>Email</Ariakit.MenuItem>
            <Ariakit.MenuItem>Message</Ariakit.MenuItem>
          </MenubarMenu>
        </MenubarMenu>
        <MenubarMenu label="Edit">
          <Ariakit.MenuItem>Undo</Ariakit.MenuItem>
          <Ariakit.MenuItem>Redo</Ariakit.MenuItem>
        </MenubarMenu>
      </Ariakit.Menubar>
      {/* In a right-to-left layout, an explicit placement keeps the menus on
          the side that points away from the menubar. */}
      <div dir="rtl">
        <Ariakit.Menubar
          aria-label="Right-to-left vertical menubar"
          orientation="vertical"
          style={{ display: "grid", width: 120, gap: 2 }}
        >
          <MenubarMenu label="Insert" placement="left-start">
            <Ariakit.MenuItem>Image</Ariakit.MenuItem>
            <Ariakit.MenuItem>Table</Ariakit.MenuItem>
          </MenubarMenu>
          <MenubarMenu label="Format" placement="left-start">
            <Ariakit.MenuItem>Bold</Ariakit.MenuItem>
            <Ariakit.MenuItem>Italic</Ariakit.MenuItem>
          </MenubarMenu>
        </Ariakit.Menubar>
      </div>
    </div>
  );
}
