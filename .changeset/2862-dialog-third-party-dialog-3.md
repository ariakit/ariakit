---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed a bug that occurred when rendering nested [Dialog](https://ariakit.org/components/dialog) elements with a third-party dialog interspersed.

Previously, Ariakit didn't recognize the third-party dialog as a nested dialog when the lowest dialog opened.
