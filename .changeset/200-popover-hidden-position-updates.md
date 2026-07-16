---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Skip position updates on hidden popovers

Popovers that stay mounted while closed, such as [`Popover`](https://ariakit.com/reference/popover), [`Tooltip`](https://ariakit.com/reference/tooltip), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), no longer set up position auto-updates while hidden, unless a custom [`updatePosition`](https://ariakit.com/reference/popover#updateposition) callback is provided. Closed popovers no longer keep standing scroll and resize listeners and observers around, and hiding a popover skips a full positioning setup and teardown cycle. This speeds up rapidly showing and hiding popovers, such as when quickly moving across toolbar items with tooltips. In the tooltip performance suite, which presses <kbd>ArrowRight</kbd> 121 times across three toolbar items, the combined changes in this release cut rendering work by 30% with a shared tooltip.

Thanks to [@aledecicco](https://github.com/aledecicco) for reporting the issue.
