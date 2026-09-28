---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed an open [`Dialog`](https://ariakit.com/reference/dialog) elsewhere on the page closing along with a [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) when one <kbd>Escape</kbd> closes the popover while one of its items is active and React renders into `document`, as in the Next.js App Router. This applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog), such as [`Popover`](https://ariakit.com/reference/popover).
