---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Command`](https://ariakit.com/reference/command) and the components that build on it, such as [`Button`](https://ariakit.com/reference/button), staying stuck in the active (`data-active`) state in the browser when the element disables itself while being pressed. Because a non-native element that becomes disabled loses focus, the releasing keyup never reaches it, so the active state is now cleared as soon as the element becomes disabled.
