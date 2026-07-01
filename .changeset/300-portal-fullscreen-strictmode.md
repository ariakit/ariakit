---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Portal`](https://ariakit.com/reference/portal), including components built on it such as [`Tooltip`](https://ariakit.com/reference/tooltip) and [`Popover`](https://ariakit.com/reference/popover), to avoid leaking duplicate portal containers in React development StrictMode when syncing with fullscreen elements.
