import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite aria-label="Two-dimensional grid with menus">
        <Ariakit.CompositeRow>
          <Ariakit.CompositeItem>Button A1</Ariakit.CompositeItem>
          <Ariakit.MenuProvider>
            <Ariakit.CompositeItem
              render={<Ariakit.MenuButton>Menu A2</Ariakit.MenuButton>}
            />
            <Ariakit.Menu>
              <Ariakit.MenuItem>Item A</Ariakit.MenuItem>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
          <Ariakit.CompositeItem>Button A3</Ariakit.CompositeItem>
        </Ariakit.CompositeRow>
        <Ariakit.CompositeRow>
          <Ariakit.CompositeItem>Button B1</Ariakit.CompositeItem>
          <Ariakit.MenuProvider>
            <Ariakit.CompositeItem
              render={<Ariakit.MenuButton>Menu B2</Ariakit.MenuButton>}
            />
            <Ariakit.Menu>
              <Ariakit.MenuItem>Item B</Ariakit.MenuItem>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
          <Ariakit.CompositeItem>Button B3</Ariakit.CompositeItem>
        </Ariakit.CompositeRow>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}
