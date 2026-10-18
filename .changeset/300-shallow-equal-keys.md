---
"@ariakit/utils": patch
---

Fixed `shallowEqual` returning `true` for objects with different keys when the values are `undefined`, such as `{ email: undefined }` and `{ phone: undefined }`.
