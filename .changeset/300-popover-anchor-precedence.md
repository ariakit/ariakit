---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`PopoverAnchor` takes precedence over disclosure elements

Synchronized the `anchorElement` state with `disclosureElement` when no explicit anchor is registered. This fixes [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure) so it no longer overrides a separate [`PopoverAnchor`](https://ariakit.com/reference/popover-anchor) as the popover's positioning anchor.

Combobox stores use the same behavior with the combobox input taking precedence over the disclosure element.

Added [`MenuAnchor`](https://ariakit.com/reference/menu-anchor), [`SelectAnchor`](https://ariakit.com/reference/select-anchor), and [`ComboboxAnchor`](https://ariakit.com/reference/combobox-anchor) components. These components take precedence over their respective disclosure or combobox elements:

```tsx
<MenuProvider>
  <MenuButton>Actions</MenuButton>
  <MenuAnchor>Position the menu here</MenuAnchor>
  <Menu>Menu items</Menu>
</MenuProvider>
```

Thanks to [@bengry](https://github.com/bengry) for reporting the issue and providing the reproduction and workaround.
