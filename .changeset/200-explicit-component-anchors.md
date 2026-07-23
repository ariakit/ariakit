---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Added `MenuAnchor`, `SelectAnchor`, and `ComboboxAnchor`

Added [`MenuAnchor`](https://ariakit.com/reference/menu-anchor), [`SelectAnchor`](https://ariakit.com/reference/select-anchor), and [`ComboboxAnchor`](https://ariakit.com/reference/combobox-anchor) components. These components take precedence over their respective disclosure or combobox elements:

```tsx
<MenuProvider>
  <MenuButton>Actions</MenuButton>
  <MenuAnchor>Position the menu here</MenuAnchor>
  <Menu>Menu items</Menu>
</MenuProvider>
```
