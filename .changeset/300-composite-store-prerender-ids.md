---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed composite-based stores generating random IDs during render, which made Next.js reject prerendering with Cache Components. This affected providers and store hooks such as [`TabProvider`](https://ariakit.com/reference/tab-provider) and [`MenuProvider`](https://ariakit.com/reference/menu-provider) without a store ID, and all composite-based providers that receive an `undefined` `id`.
