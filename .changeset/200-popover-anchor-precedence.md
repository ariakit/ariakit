---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`PopoverAnchor` takes precedence over disclosures

Updated popover positioning to fall back to the `disclosureElement` state only when the `anchorElement` state is `null`. This fixes [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure) so it no longer overrides a separate [`PopoverAnchor`](https://ariakit.com/reference/popover-anchor) as the popover's positioning anchor.

The `anchorElement` state now represents only an explicit anchor. When no explicit anchor is set, it remains `null` while the popover positions itself relative to the `disclosureElement` state.

[`ComboboxDisclosure`](https://ariakit.com/reference/combobox-disclosure) now sets itself as the `disclosureElement`. Popover positioning resolves a [`ComboboxAnchor`](https://ariakit.com/reference/combobox-anchor) first, then the [`Combobox`](https://ariakit.com/reference/combobox) input, and finally the [`ComboboxDisclosure`](https://ariakit.com/reference/combobox-disclosure).

Added [`MenuAnchor`](https://ariakit.com/reference/menu-anchor), [`SelectAnchor`](https://ariakit.com/reference/select-anchor), and [`ComboboxAnchor`](https://ariakit.com/reference/combobox-anchor) components. These components take precedence over their respective disclosure or combobox elements:

```tsx
<MenuProvider>
  <MenuButton>Actions</MenuButton>
  <MenuAnchor>Position the menu here</MenuAnchor>
  <Menu>Menu items</Menu>
</MenuProvider>
```

Thanks to [@bengry](https://github.com/bengry) for reporting the issue and providing the reproduction and workaround.
