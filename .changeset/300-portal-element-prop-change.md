---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Portal`](https://ariakit.com/reference/portal) moving the element passed to [`portalElement`](https://ariakit.com/reference/portal#portalelement) to `document.body` when the prop changed to `null` while the portal was mounted. This applies to all components built on [`Portal`](https://ariakit.com/reference/portal), such as [`Dialog`](https://ariakit.com/reference/dialog) and [`Popover`](https://ariakit.com/reference/popover).
