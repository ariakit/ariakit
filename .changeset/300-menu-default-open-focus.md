---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Menus that mount already open take focus

A [`Menu`](https://ariakit.com/reference/menu) that is already open when it mounts, through [`defaultOpen`](https://ariakit.com/reference/menu-provider#defaultopen) or a controlled open state, now moves focus into the menu. Previously focus stayed where it was while the first item still appeared highlighted, leaving keyboard and screen reader users outside an open menu with no way to navigate it.

```tsx
<MenuProvider defaultOpen>
  <MenuButton>Actions</MenuButton>
  {/* The menu now takes focus, and no item is highlighted. */}
  <Menu>
    <MenuItem>Rename</MenuItem>
    <MenuItem>Duplicate</MenuItem>
  </Menu>
</MenuProvider>
```

Focus lands on the menu itself, which is where clicking [`MenuButton`](https://ariakit.com/reference/menu-button) with a mouse already puts it. Modal menus opened this way used to focus the first item instead, so both now behave the same. Menus opened by hovering a [`MenuButton`](https://ariakit.com/reference/menu-button), such as submenus and menubar menus, still leave focus alone. To open a menu without moving focus, for example one restored from saved state on page load, pass [`autoFocusOnShow={false}`](https://ariakit.com/reference/menu#autofocusonshow).

Thanks to [@ciampo](https://github.com/ciampo) for reporting the issue and providing the workaround that informed this solution.
