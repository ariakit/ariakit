---
"@ariakit/react": patch
"@ariakit/react-components": patch
"@ariakit/react-utils": patch
---

Fixed [`useMergeRefs`](https://ariakit.com/reference/use-merge-refs) and [`Portal`](https://ariakit.com/reference/portal) to preserve React 19 callback ref cleanup functions while still detaching refs that don't return a cleanup.
