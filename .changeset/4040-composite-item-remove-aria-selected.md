---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

`aria-selected` on composite items

Composite items like [`ComboboxItem`](https://ariakit.org/reference/combobox-item) no longer have the `aria-selected` attribute automatically set when focused. This attribute was previously used to address an old bug in Google Chrome, but it's no longer needed. Now, it's only set when the item is actually selected, such as in a select widget or a multi-selectable combobox.

This change shouldn't affect most users since the `aria-selected` attribute is not part of the public API and is not recommended as a [CSS selector](https://ariakit.org/guide/styling#css-selectors) (use [`[data-active-item]`](https://ariakit.org/guide/styling#data-active-item) instead). However, if you have snapshot tests, you may need to update them.
