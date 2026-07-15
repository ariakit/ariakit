import * as Ariakit from "@ariakit/react";

const rows = Array.from({ length: 80 }, (_, index) => index);

function RowMenu({ index }: { index: number }) {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Row {index} actions</Ariakit.MenuButton>
      <Ariakit.Menu gutter={4}>
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Duplicate</Ariakit.MenuItem>
        <Ariakit.MenuItem>Delete</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

// An `alwaysVisible` menu is shown even while its store is closed, so its items
// must still register. The list below mirrors the store's registered items.
function AlwaysVisibleMenu() {
  const menu = Ariakit.useMenuStore();
  const items = Ariakit.useStoreState(menu, "items");
  return (
    <>
      <Ariakit.MenuProvider store={menu}>
        <Ariakit.MenuButton>Always visible actions</Ariakit.MenuButton>
        <Ariakit.Menu alwaysVisible>
          <Ariakit.MenuItem>Save</Ariakit.MenuItem>
          <Ariakit.MenuItem>Open</Ariakit.MenuItem>
          <Ariakit.MenuItem>Close</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <ul aria-label="Registered items">
        {items.map((item) => (
          <li key={item.id}>{item.id}</li>
        ))}
      </ul>
    </>
  );
}

export default function Example() {
  return (
    <div>
      {rows.map((index) => (
        <RowMenu key={index} index={index} />
      ))}
      <AlwaysVisibleMenu />
    </div>
  );
}
