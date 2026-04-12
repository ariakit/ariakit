---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) and components that extend it, such as [`Menu`](https://ariakit.com/reference/menu) and [`Popover`](https://ariakit.com/reference/popover), not handling events correctly when rendered in a popup window opened via `window.open()`.

[`hideOnEscape`](https://ariakit.com/reference/dialog#hideonescape), [`hideOnInteractOutside`](https://ariakit.com/reference/dialog#hideoninteractoutside), and focus restoration now work correctly in popup windows by using the content element's `ownerDocument` instead of the main window's `document` for event listeners.
