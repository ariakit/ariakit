---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Focus decisions on a page with a form named `activeElement`

A document exposes `embed`, `form`, `iframe`, `img`, and `object` elements carrying a `name` attribute as own properties that override built-ins, so a page containing `<form name="activeElement">` answers `document.activeElement` with the form. Three focus decisions read that member directly, so each of them was silently making its decision from the form instead of the focused element.

[`Dialog`](https://ariakit.com/reference/dialog), and every component built on it, no longer pull focus back into themselves from an element the application legitimately focused while the dialog was still being placed. That reaches [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Tooltip`](https://ariakit.com/reference/tooltip), [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover).

[`ComboboxList`](https://ariakit.com/reference/combobox-list), and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) which builds on it, hand focus back to the combobox again when the list itself receives it, so arrow keys keep reaching the items.

Changing the selected tab while a [`Tab`](https://ariakit.com/reference/tab) holds DOM focus moves focus to the newly selected tab again, instead of leaving it behind on the previously selected one.
