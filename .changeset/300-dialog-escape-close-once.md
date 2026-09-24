---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`hideOnEscape`](https://ariakit.com/reference/dialog#hideonescape) running twice for one <kbd>Escape</kbd>, and [`onClose`](https://ariakit.com/reference/dialog#onclose) running twice when it prevents the close, when a combobox or select in the popup, or the one that controls it, has an active item. This applies to components such as [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) and [`SelectPopover`](https://ariakit.com/reference/select-popover).
