---
"@ariakit/react": patch
"@ariakit/react-components": patch
---

Collapsed combobox controls keep focus

[`ComboboxSelect`](https://ariakit.com/reference/combobox-select) and [`Combobox`](https://ariakit.com/reference/combobox) no longer move DOM focus into their popup while it is closed. This was visible whenever the options stayed on screen next to the collapsed control, such as with an [`alwaysVisible`](https://ariakit.com/reference/combobox-list#alwaysvisible) [`ComboboxList`](https://ariakit.com/reference/combobox-list), where focusing either control, or typing a letter on the select, moved DOM focus onto an option of a listbox that still reported `aria-expanded="false"`, firing focus and blur on it and, without virtual focus, leaving focus there.

The list still scrolls to the active option, and opening the popup still presents the option that was made active while it was closed.
