---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed events not handled in popup windows

[`Dialog`](https://ariakit.com/reference/dialog) and components that extend it, such as [`Menu`](https://ariakit.com/reference/menu) and [`Popover`](https://ariakit.com/reference/popover), now handle events correctly when rendered in a popup window opened via `window.open()`. [`hideOnEscape`](https://ariakit.com/reference/dialog#hideonescape), [`hideOnInteractOutside`](https://ariakit.com/reference/dialog#hideoninteractoutside), and focus restoration now use the content element's `ownerDocument` instead of the main window's `document` for event listeners.
