---
"@ariakit/utils": patch
---

Fixed `getDocument` and `getWindow` reporting the ambient document and window for a document that belongs to another realm, such as the one inside a same-origin iframe.
