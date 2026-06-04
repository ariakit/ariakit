---
"@ariakit/react-components": patch
---

Fixed virtualized `CompositeRenderer` and `SelectRenderer` (and the underlying `CollectionRenderer`) leaking a `ResizeObserver` and detached item nodes when `itemSize` is not set. Items that stop being rendered are now unobserved, and the observer is disconnected when the renderer unmounts.
