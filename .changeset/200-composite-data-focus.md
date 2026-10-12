---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Supplemental focus styling

Composite widgets now apply `data-focus` to their active item while DOM focus stays on the composite element. This supports virtual focus and hover focus in [`Composite`](https://ariakit.com/reference/composite) and all components built on it. The attribute styles active items in these public components:

- [`Combobox`](https://ariakit.com/reference/combobox), [`ComboboxInput`](https://ariakit.com/reference/combobox-input), and [`ComboboxSelect`](https://ariakit.com/reference/combobox-select).
- [`Menu`](https://ariakit.com/reference/menu), [`MenuList`](https://ariakit.com/reference/menu-list), [`Menubar`](https://ariakit.com/reference/menubar), and [`MenuBar`](https://ariakit.com/reference/menu-bar).
- [`RadioGroup`](https://ariakit.com/reference/radio-group).
- [`SelectList`](https://ariakit.com/reference/select-list) and [`SelectPopover`](https://ariakit.com/reference/select-popover).
- [`TabList`](https://ariakit.com/reference/tab-list).
- [`Toolbar`](https://ariakit.com/reference/toolbar).

Combine native `:focus` with the attribute to style current focus in either mode:

```css
.item:is(:focus, [data-focus]) {
  background-color: Highlight;
}
```

The `data-active-item` attribute keeps its existing behavior and can remain after focus leaves. The new attribute clears when the composite loses focus or the item stops being active. Elements with DOM focus continue to use native `:focus`.

Thanks to [@joseDaKing](https://github.com/joseDaKing) for proposing focus state attributes and [@DaniGuardiola](https://github.com/DaniGuardiola) for discussing how state attributes relate to native CSS selectors.
