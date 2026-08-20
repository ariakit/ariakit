---
"@ariakit/utils": patch
---

Fixed `isElement` and `isNode` rejecting a form that contains a control named `nodeType`, and fixed `getDocument` and `getWindow` falling back to the ambient realm when named elements shadow `ownerDocument` or `defaultView` inside a frame.
