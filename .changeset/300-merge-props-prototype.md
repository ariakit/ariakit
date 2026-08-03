---
"@ariakit/react-utils": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed `mergeProps` so an own `__proto__` prop cannot replace the merged props object's prototype in rendered [`Role`](https://ariakit.com/reference/role) elements.
