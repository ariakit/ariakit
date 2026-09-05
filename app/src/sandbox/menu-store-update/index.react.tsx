import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const menuStyle = {
  display: "grid",
  padding: 4,
  border: "1px solid",
  background: "white",
  color: "black",
};

// A standalone menu whose open state is linked to one of two panels. Choosing
// the other panel replaces the linked disclosure store, which recreates the
// menu store. The placement written from an event handler must survive that.
function LinkedMenu() {
  const [linked, setLinked] = useState<"first" | "second">("first");
  const firstPanel = Ariakit.useDisclosureStore();
  const secondPanel = Ariakit.useDisclosureStore();
  const menu = Ariakit.useMenuStore({
    disclosure: linked === "first" ? firstPanel : secondPanel,
  });
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <Ariakit.MenuButton store={menu}>Actions</Ariakit.MenuButton>
        <Ariakit.Menu store={menu} style={menuStyle}>
          <Ariakit.MenuItem>Rename</Ariakit.MenuItem>
          <Ariakit.MenuItem>Delete</Ariakit.MenuItem>
        </Ariakit.Menu>
        <Ariakit.Button
          onClick={() => menu.setState("placement", "right-start")}
        >
          Open beside
        </Ariakit.Button>
        <Ariakit.Button
          onClick={() => setLinked(linked === "first" ? "second" : "first")}
        >
          {linked === "first" ? "Link to second panel" : "Link to first panel"}
        </Ariakit.Button>
      </div>
      <Ariakit.Disclosure store={firstPanel}>First panel</Ariakit.Disclosure>
      <Ariakit.DisclosureContent store={firstPanel}>
        First panel content
      </Ariakit.DisclosureContent>
      <Ariakit.Disclosure store={secondPanel}>Second panel</Ariakit.Disclosure>
      <Ariakit.DisclosureContent store={secondPanel}>
        Second panel content
      </Ariakit.DisclosureContent>
    </div>
  );
}

// A command list that the user shows as a toolbar or as a sidebar. Each layout
// keeps its own menu store, so switching layouts replaces the parent store of
// the Share submenu, which must then open away from the new layout.
function CommandList() {
  const [sidebar, setSidebar] = useState(false);
  const toolbarStore = Ariakit.useMenuStore({ orientation: "horizontal" });
  const sidebarStore = Ariakit.useMenuStore({ orientation: "vertical" });
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <Ariakit.Button onClick={() => setSidebar(!sidebar)}>
        {sidebar ? "Show as toolbar" : "Show as sidebar"}
      </Ariakit.Button>
      <Ariakit.MenuProvider store={sidebar ? sidebarStore : toolbarStore}>
        <Ariakit.MenuList
          aria-label="Commands"
          alwaysVisible
          style={{
            display: "grid",
            gridAutoFlow: sidebar ? "row" : "column",
            width: sidebar ? 120 : undefined,
            gap: 2,
          }}
        >
          <Ariakit.MenuItem>Save</Ariakit.MenuItem>
          <Ariakit.MenuProvider>
            <Ariakit.MenuItem render={<Ariakit.MenuButton />}>
              Share
            </Ariakit.MenuItem>
            <Ariakit.Menu style={menuStyle}>
              <Ariakit.MenuItem>Email</Ariakit.MenuItem>
              <Ariakit.MenuItem>Message</Ariakit.MenuItem>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
        </Ariakit.MenuList>
      </Ariakit.MenuProvider>
    </div>
  );
}

// Menus whose stores are recreated because a linked store changes.
export default function Example() {
  return (
    <div style={{ display: "grid", gap: 40, justifyItems: "start" }}>
      <LinkedMenu />
      <CommandList />
    </div>
  );
}
