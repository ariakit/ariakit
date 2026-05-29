---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) throwing a `TypeError` when an event with a non-element target (such as one dispatched on `window` or an `XMLHttpRequest`) reached its global document listeners while the dialog was open.
