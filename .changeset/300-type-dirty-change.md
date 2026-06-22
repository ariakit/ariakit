---
"@ariakit/test": patch
---

Fixed `type` so readonly fields, prevented keydowns, non-text-field targets, and no-op deletion keys no longer cause `blur` or `focus` to dispatch a `change` event when the value did not change.
