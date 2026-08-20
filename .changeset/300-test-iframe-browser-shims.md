---
"@ariakit/test": patch
---

Fixed the test helpers to apply browser shims in the target element's own realm, so pointer, keyboard, and clipboard events reach elements inside same-origin iframes under jsdom instead of being dropped.
