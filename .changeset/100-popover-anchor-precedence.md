---
"@ariakit/react-components": minor
"@ariakit/react": minor
---

`PopoverAnchor` takes precedence over disclosures

**BREAKING** if you read the `anchorElement` store state to identify the disclosure that opened a popover. The state now contains only an explicit positioning anchor; read `disclosureElement` for the active disclosure instead.

Before:

```tsx
const open = useStoreState(
  store,
  (state) => state.mounted && state.anchorElement === button,
);
```

After:

```tsx
const open = useStoreState(
  store,
  (state) => state.mounted && state.disclosureElement === button,
);
```

Updated popover positioning to fall back to the `disclosureElement` state only when the `anchorElement` state is `null`. This fixes [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure) so it no longer overrides a separate [`PopoverAnchor`](https://ariakit.com/reference/popover-anchor) as the popover's positioning anchor.

The `anchorElement` state now represents only an explicit anchor. When no explicit anchor is set, it remains `null` while the popover positions itself relative to the `disclosureElement` state.

To derive the resolved positioning element for a generic popover, read `state.anchorElement || state.disclosureElement`. Combobox popovers additionally use the `baseElement` state before falling back to `disclosureElement`.

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
