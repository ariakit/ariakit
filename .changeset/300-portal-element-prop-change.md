---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Portal`](https://ariakit.com/reference/portal) moving a custom container when [`portalElement`](https://ariakit.com/reference/portal#portalelement) changes to `null`, if the container was already in the document when assigned. This applies to all components built on [`Portal`](https://ariakit.com/reference/portal), such as [`Dialog`](https://ariakit.com/reference/dialog) and [`Popover`](https://ariakit.com/reference/popover).
