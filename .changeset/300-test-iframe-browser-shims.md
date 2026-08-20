---
"@ariakit/test": patch
---

Fixed `click`, `hover`, `press`, and `dispatch` to apply browser shims in the target element's own realm, so interactions and clipboard events work inside same-origin iframes under jsdom.
