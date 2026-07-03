---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved the performance of the composite store's [`next`](https://ariakit.com/reference/use-composite-store#next), [`previous`](https://ariakit.com/reference/use-composite-store#previous), [`up`](https://ariakit.com/reference/use-composite-store#up), and [`down`](https://ariakit.com/reference/use-composite-store#down) functions, which now scan the rendered items without copying arrays in the most common cases.
