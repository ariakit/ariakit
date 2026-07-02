---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Faster modal `Dialog` opening on large pages

Opening a modal [`Dialog`](https://ariakit.com/reference/dialog) — or components built on it, such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu) — now paints without waiting for the page behind it to be disabled.

Previously, the dialog made the element tree outside it inert and locked the body scroll before its first paint. Both steps invalidate the styles of the entire page, so the browser had to recalculate the style of every element outside the dialog before showing it, delaying the open in proportion to the page size. These steps now run right after the dialog is first painted: the dialog shows up immediately, and the outside tree becomes inert one frame later.
