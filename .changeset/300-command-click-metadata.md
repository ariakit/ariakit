---
"@ariakit/utils": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed `fireClickEvent` so clicks expose the target element's owner window through `view` and are composed. This also fixed keyboard activation on non-native [`Command`](https://ariakit.com/reference/command) elements and components built on [`Command`](https://ariakit.com/reference/command), such as [`Button`](https://ariakit.com/reference/button).
