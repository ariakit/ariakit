---
tags:
  - New
  - Menu
  - Combobox
  - Dropdowns
  - Abstracted examples
---

# Submenu with Combobox

<div data-description>

Rendering nested [Menu](/components/menu) components to create a dropdown menu with submenus that open when hovering over the parent menu item.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/menu)

</div>

## Anatomy of nested menus

In this example, we created a higher-level abstraction of the [Menu](/components/menu) component that automatically renders a [`MenuButton`](/reference/menu-button) as a [`MenuItem`](/reference/menu-item) if there's a [`parent`](/reference/use-menu-store#parent) menu store. This way, you can easily copy and paste it into your project.

However, in practice, creating submenus with Ariakit is as straightforward as nesting `Menu` components and merging [`MenuButton`](/reference/menu-button) and [`MenuItem`](/reference/menu-item) into a single element using the [`render`](/apis/menu-item#render) prop:

```jsx {6-12} "render"
<MenuProvider>
  <MenuButton>Edit</MenuButton>
  <Menu>
    <MenuItem>Undo</MenuItem>
    <MenuItem>Redo</MenuItem>
    <MenuProvider>
      <MenuItem render={<MenuButton />}>Find</MenuItem>
      <Menu>
        <MenuItem>Find Next</MenuItem>
        <MenuItem>Find Previous</MenuItem>
      </Menu>
    </MenuProvider>
  </Menu>
</MenuProvider>
```

## Related examples

<div data-cards="examples">

- [](/examples/menu-tooltip)
- [](/examples/menu-item-checkbox)
- [](/examples/menu-framer-motion)
- [](/examples/menubar-navigation)

</div>
