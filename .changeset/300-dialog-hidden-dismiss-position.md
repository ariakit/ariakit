---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Modal popups render their fallback dismiss button next to the popup

A modal [`Dialog`](https://ariakit.com/reference/dialog) with no [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss) renders a visually hidden dismiss button, so that assistive technology users who can't press Escape or click outside aren't trapped. That button used to be the first child of the popup element. It now renders next to it, still inside the modal context.

This means a popup whose role doesn't allow a `button` among its owned elements no longer has one. It applies to every component built on [`Dialog`](https://ariakit.com/reference/dialog), including [`SelectPopover`](https://ariakit.com/reference/select-popover) and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), which render with `role="listbox"` by default.

The button is still visually hidden and still isn't reachable with Tab, so this is only visible to code that looks for it in the DOM, such as a CSS selector matching the popup's first child, or a test that queries for a button within the popup.

Thanks to [@afercia](https://github.com/afercia) for reporting the issue.
