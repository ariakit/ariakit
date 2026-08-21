---
"@ariakit/utils": patch
---

Fixed `getDocument` and `getWindow` trusting a member that a form or a document can answer with one of its own elements, so they now check what came back and fall back instead of returning a value of the wrong type, and typed `getWindow`'s result the way `document.defaultView` is so the interfaces a window carries can be read off it.
