---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed [`render`](https://ariakit.com/guide/composition) prop merging when the rendered element passes falsy `className` or event handler values such as `undefined` or `null`.
