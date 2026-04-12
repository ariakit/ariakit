---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed `Portal` not rendering inside fullscreen elements

[`Portal`](https://ariakit.com/reference/portal) was always appended to `document.body`, which made it invisible when an ancestor element entered fullscreen mode via the Fullscreen API. Portals are now automatically moved to `document.fullscreenElement` when it's active, and back to `document.body` when fullscreen is exited.
