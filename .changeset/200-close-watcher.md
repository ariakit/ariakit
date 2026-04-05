---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

CloseWatcher API support for dialogs

The [`Dialog`](https://ariakit.org/reference/dialog) component now uses the [CloseWatcher](https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher) API when supported by the browser. This enables dismissing dialogs, popovers, and menus with the Android back gesture and screen reader back gestures, in addition to the Escape key.

Browsers without CloseWatcher support continue to use the existing keyboard event listener as a fallback.
