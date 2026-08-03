---
"@ariakit/react-utils": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Checkbox`](https://ariakit.com/reference/checkbox) and other components composed with [`render`](https://ariakit.com/reference/checkbox#render) to preserve computed props when a render element receives `undefined`, while still allowing generated IDs to be explicitly removed. Thanks to [@Jackardios](https://github.com/Jackardios).
