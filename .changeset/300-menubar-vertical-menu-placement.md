---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Arrow keys in vertical menubars

Menus inside a [`Menubar`](https://ariakit.com/reference/menubar) with `orientation="vertical"` now open beside their [`MenuButton`](https://ariakit.com/reference/menu-button) instead of below it, so <kbd>ArrowRight</kbd> opens the menu and <kbd>ArrowLeft</kbd> closes it. A [`MenuButtonArrow`](https://ariakit.com/reference/menu-button-arrow) on that button points to the same side. In a right-to-left layout, pass `placement="left-start"` so the menu still opens away from the menubar.

```tsx
<Ariakit.Menubar orientation="vertical">
  <Ariakit.MenuProvider>
    <Ariakit.MenuItem render={<Ariakit.MenuButton />}>File</Ariakit.MenuItem>
    <Ariakit.Menu>
      <Ariakit.MenuItem>New</Ariakit.MenuItem>
    </Ariakit.Menu>
  </Ariakit.MenuProvider>
</Ariakit.Menubar>
```

Each menu settles its placement when its store is created, so a menubar or parent menu that turns vertical afterwards leaves its menus below their items, with no arrow key that opens them. A menu whose store is linked to another [`store`](https://ariakit.com/reference/menu-provider#store) created outside its parent menu or menubar behaves the same way. Earlier versions moved a submenu in both cases. Pass a [`placement`](https://ariakit.com/reference/menu-provider#placement) to control it.

A menu that shares state with a [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider) now keeps its own placement, so set the [`placement`](https://ariakit.com/reference/menu-provider#placement) on the menu rather than on the combobox.
