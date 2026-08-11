import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton
          accessibleWhenDisabled
          disabled
          render={<Ariakit.Button />}
        >
          MenuButton props
        </Ariakit.MenuButton>
        <Ariakit.Menu>
          <Ariakit.MenuItem>Item 1</Ariakit.MenuItem>
          <Ariakit.MenuItem>Item 2</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>

      <Ariakit.MenuProvider>
        <Ariakit.MenuButton
          render={<Ariakit.Button accessibleWhenDisabled disabled />}
        >
          Render props
        </Ariakit.MenuButton>
        <Ariakit.Menu>
          <Ariakit.MenuItem>Item 1</Ariakit.MenuItem>
          <Ariakit.MenuItem>Item 2</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>

      {/* Opening a menu is an activation, so hovering must not open these
      either, in either composition order. */}
      <Ariakit.MenuProvider timeout={0}>
        <Ariakit.MenuButton
          showOnHover
          accessibleWhenDisabled
          disabled
          render={<Ariakit.Button />}
        >
          Hover MenuButton props
        </Ariakit.MenuButton>
        <Ariakit.Menu>
          <Ariakit.MenuItem>Item 1</Ariakit.MenuItem>
          <Ariakit.MenuItem>Item 2</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>

      <Ariakit.MenuProvider timeout={0}>
        <Ariakit.MenuButton
          showOnHover
          render={<Ariakit.Button accessibleWhenDisabled disabled />}
        >
          Hover render props
        </Ariakit.MenuButton>
        <Ariakit.Menu>
          <Ariakit.MenuItem>Item 1</Ariakit.MenuItem>
          <Ariakit.MenuItem>Item 2</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>

      {/* Enabled control with the same setup, so the assertions above fail if
      hovering ever stops opening a menu at all. */}
      <Ariakit.MenuProvider timeout={0}>
        <Ariakit.MenuButton showOnHover render={<Ariakit.Button />}>
          Hover enabled
        </Ariakit.MenuButton>
        <Ariakit.Menu>
          <Ariakit.MenuItem>Item 1</Ariakit.MenuItem>
          <Ariakit.MenuItem>Item 2</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </div>
  );
}
