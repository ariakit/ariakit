---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed [`Focusable`](https://ariakit.org/reference/focusable) Safari focus handling for native buttons, checkboxes, and radios by using `tabIndex` normalization instead of custom mouse-event workarounds.
