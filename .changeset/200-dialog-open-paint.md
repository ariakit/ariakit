---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Faster modal `Dialog` opening

Opening a modal [`Dialog`](https://ariakit.com/reference/dialog), or a component built on it such as [`Popover`](https://ariakit.com/reference/popover) or [`Menu`](https://ariakit.com/reference/menu) with the [`modal`](https://ariakit.com/reference/popover#modal) prop, no longer waits for the page behind it to be disabled before painting.

Previously, making the element tree outside the dialog inert invalidated the styles of the entire page before the dialog's first paint, delaying the open in proportion to the page size. Now the inert step runs right after the dialog is first painted, so the page outside stays interactive and exposed to assistive technology for about one frame longer. The outside-click and Escape logic is unaffected: it relies on element marks that still apply synchronously. On browsers without CSS `scrollbar-gutter` support, when the scroll lock must remove a visible scrollbar, everything still applies before the first paint, matching the previous behavior.
