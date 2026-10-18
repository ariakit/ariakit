---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Portal`](https://ariakit.com/reference/portal) with [`preserveTabOrder`](https://ariakit.com/reference/portal#preservetaborder) leaving elements inside same-origin iframes out of the tab order after focus left the portal and returned. This also applies to components that render in a portal with this behavior, such as non-modal [`Popover`](https://ariakit.com/reference/popover).
