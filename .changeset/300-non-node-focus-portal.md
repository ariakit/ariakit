---
"@ariakit/utils": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Focusable`](https://ariakit.com/reference/focusable), [`Combobox`](https://ariakit.com/reference/combobox), [`Composite`](https://ariakit.com/reference/composite), and [`Portal`](https://ariakit.com/reference/portal) throwing a `TypeError` when a programmatically dispatched focus event carried a non-element `relatedTarget` or `target` (such as `window` or an `XMLHttpRequest`), by hardening the shared `isFocusEventOutside` and `isPortalEvent` helpers.
