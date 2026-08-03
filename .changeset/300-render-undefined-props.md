---
"@ariakit/react-utils": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Checkbox`](https://ariakit.com/reference/checkbox) and other components composed with [`render`](https://ariakit.com/reference/checkbox#render) to preserve computed props when a render element explicitly receives `undefined`, while explicit values, including `null`, continue to override computed props. Thanks to [@Jackardios](https://github.com/Jackardios).
