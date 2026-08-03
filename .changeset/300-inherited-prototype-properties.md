---
"@ariakit/utils": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed components such as [`Button`](https://ariakit.com/reference/button) and [`Checkbox`](https://ariakit.com/reference/checkbox) copying inherited enumerable `Object.prototype` properties onto the element they render.
