---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Portal`](https://ariakit.com/reference/portal) with [`preserveTabOrder`](https://ariakit.com/reference/portal#preservetaborder) removing its elements from the tab order when focus moved into a same-origin iframe inside the portal, so <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> from the iframe skipped the elements around it. This also applies to components that render in a portal with this behavior, such as non-modal [`Popover`](https://ariakit.com/reference/popover).
