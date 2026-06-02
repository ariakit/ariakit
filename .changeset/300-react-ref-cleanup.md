---
"@ariakit/react": patch
"@ariakit/react-components": patch
"@ariakit/react-utils": patch
---

Fixed merged refs in React components and [`Portal`](https://ariakit.com/reference/portal) to preserve React 19 callback ref cleanup functions while still detaching refs that don't return a cleanup.
