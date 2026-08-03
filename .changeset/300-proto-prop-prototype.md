---
"@ariakit/utils": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed components such as [`Button`](https://ariakit.com/reference/button) and [`Checkbox`](https://ariakit.com/reference/checkbox) treating values carried by a `__proto__` prop passed directly to them, such as one coming from parsed JSON, as props they were never given.
