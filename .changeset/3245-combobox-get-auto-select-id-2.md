---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Styling Combobox without an active descendant

The [`Combobox`](https://ariakit.org/reference/combobox) component now includes a [`data-active-item`](https://ariakit.org/guide/styling#data-active-item) attribute when it's the only active item in the composite widget. In other words, when no [`ComboboxItem`](https://ariakit.org/reference/combobox-item) is active and the focus is solely on the combobox input.

You can use this as a CSS selector to style the combobox differently, providing additional affordance to users who pressed <kbd>↑</kbd> on the first item or <kbd>↓</kbd> on the last item. This action would place both virtual and actual DOM focus on the combobox input.

```css
.combobox[data-active-item] {
  outline-width: 2px;
}
```
