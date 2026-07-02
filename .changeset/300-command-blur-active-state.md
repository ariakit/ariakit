---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed `Command` stuck pressed state when losing focus mid-press

When rendering a non-native element (such as `render={<div />}`), the [`Command`](https://ariakit.com/reference/command) component — and components built on it, such as [`Button`](https://ariakit.com/reference/button), [`Checkbox`](https://ariakit.com/reference/checkbox), [`CompositeItem`](https://ariakit.com/reference/composite-item), and their derivatives — now clears its pressed state (`data-active`) when the element loses focus while <kbd>Space</kbd> is held, mirroring how native buttons cancel the Space activation when they lose focus before the keyup.

Additionally, a Space keyup bubbling up from a focused child no longer dispatches a synthetic click on the element, and calling `event.preventDefault()` in a custom `onKeyUp` handler no longer leaves the element stuck looking pressed.
