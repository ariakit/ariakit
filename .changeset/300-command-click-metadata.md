---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed keyboard activation on non-native [`Command`](https://ariakit.com/reference/command) elements and components built on [`Command`](https://ariakit.com/reference/command), such as [`Button`](https://ariakit.com/reference/button), so their synthetic clicks use the element's owner window for `view` and are composed.
