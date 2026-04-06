import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
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

      <Ariakit.MenuProvider timeout={0}>
        <Ariakit.MenuButton
          showOnHover
          render={<Ariakit.Button accessibleWhenDisabled disabled />}
        >
          Render props
        </Ariakit.MenuButton>
        <Ariakit.Menu>
          <Ariakit.MenuItem>Item 1</Ariakit.MenuItem>
          <Ariakit.MenuItem>Item 2</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>

      <Ariakit.MenuProvider timeout={0}>
        <Ariakit.MenuButton showOnHover render={<Ariakit.Button />}>
          Enabled hover
        </Ariakit.MenuButton>
        <Ariakit.Menu>
          <Ariakit.MenuItem>Item 1</Ariakit.MenuItem>
          <Ariakit.MenuItem>Item 2</Ariakit.MenuItem>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </div>
  );
}
