---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Faster modal `Dialog` opening

Opening a modal [`Dialog`](https://ariakit.com/reference/dialog) — or components built on it, such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu) — no longer waits for the page behind it to be disabled before painting.

Previously, making the element tree outside the dialog inert and writing the `--scrollbar-width` property each invalidated the styles of the entire page before the dialog's first paint, delaying the open in proportion to the page size. Now the inert step runs right after the dialog is first painted, and the scroll lock skips the `--scrollbar-width` and padding writes when there's no scrollbar width to compensate (`var(--scrollbar-width, 0)` reads are unaffected). When a visible scrollbar must be removed, everything still applies before the first paint, so `position: fixed` elements — including the dialog itself — don't shift after the dialog appears.
