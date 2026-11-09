---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`Hovercard` staying open while in use

[`Hovercard`](https://ariakit.com/reference/hovercard) no longer hides in these cases:

- **Mouse in a frame.** The mouse moves inside a same-origin `iframe` in the hovercard.
- **Focus in a frame.** The mouse leaves the hovercard while focus is inside a same-origin `iframe` in it.
- **Press on the hovercard.** A press that started on the hovercard lasts, such as a drag on a resize grip inside it that goes past its edge.

These fixes apply to all components built on [`Hovercard`](https://ariakit.com/reference/hovercard), such as [`Menu`](https://ariakit.com/reference/menu) and [`Tooltip`](https://ariakit.com/reference/tooltip).
