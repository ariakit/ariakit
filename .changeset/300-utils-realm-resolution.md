---
"@ariakit/utils": patch
---

Fixed `getDocument` and `getWindow` resolving a realm from a member name, which a form or a document can answer with one of its own elements, and typed `getWindow`'s result the way `document.defaultView` is so the interfaces a window carries can be read off it.
