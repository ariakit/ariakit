---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed composite widgets failing to scroll to their active item when that item's element was replaced while the popup was still being positioned, which affects [`Combobox`](https://ariakit.com/reference/combobox), [`Select`](https://ariakit.com/reference/select) and [`Menu`](https://ariakit.com/reference/menu). This could happen when an app swapped in a fresh list as the popup opened, with the same item ids under new React keys, leaving the popup scrolled to the top instead of to the active item.
