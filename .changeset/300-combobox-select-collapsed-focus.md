---
"@ariakit/react": patch
"@ariakit/react-components": patch
---

Fixed [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) and [`Combobox`](https://ariakit.com/reference/combobox) moving DOM focus off the collapsed control and into their popup, which was visible when the options stayed on screen next to it, such as with an [`alwaysVisible`](https://ariakit.com/reference/combobox-list#alwaysvisible) [`ComboboxList`](https://ariakit.com/reference/combobox-list).
