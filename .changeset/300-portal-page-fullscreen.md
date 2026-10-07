---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Portal`](https://ariakit.com/reference/portal) moving its portal element from `document.body` to the `<html>` element when the page itself entered fullscreen, such as with `document.documentElement.requestFullscreen()`. This applies to all components built on [`Portal`](https://ariakit.com/reference/portal), such as [`Dialog`](https://ariakit.com/reference/dialog) and [`Popover`](https://ariakit.com/reference/popover).
