---
"@ariakit/react-components": patch
---

Fixed virtualized [`CompositeRenderer`](https://ariakit.com/reference/composite-renderer) and [`SelectRenderer`](https://ariakit.com/reference/select-renderer) (and the underlying [`CollectionRenderer`](https://ariakit.com/reference/collection-renderer)) leaking a `ResizeObserver` and detached item nodes when `itemSize` is not set. Items that stop being rendered are now unobserved, and the observer is disconnected when the renderer unmounts.
