---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Focusable`](https://ariakit.com/reference/focusable) and components built on it, such as [`Tab`](https://ariakit.com/reference/tab) and [`Button`](https://ariakit.com/reference/button), so a middle click no longer opens the destination of a [`disabled`](https://ariakit.com/reference/focusable#disabled) element rendered as a link, including one kept reachable by [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled), which [`Tab`](https://ariakit.com/reference/tab) enables by default.
