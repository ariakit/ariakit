---
"@ariakit/utils": patch
---

Fixed `fireClickEvent` so clicks use the target element's owner window for `view` and are composed.
