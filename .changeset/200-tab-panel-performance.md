---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Reduced the work performed by [`TabPanel`](https://ariakit.com/reference/tab-panel) during rendering and navigation by avoiding unused collection subscriptions and scroll-restoration allocations.
