---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Portal`](https://ariakit.com/reference/portal), including components built on it such as [`Dialog`](https://ariakit.com/reference/dialog) and [`Popover`](https://ariakit.com/reference/popover), destroying and recreating the portal node when the [`portalRef`](https://ariakit.com/reference/portal#portalref) prop changes identity, such as when passing an inline callback. The ref now re-fires against the same portal node, so the portal content is no longer remounted on parent re-renders.
