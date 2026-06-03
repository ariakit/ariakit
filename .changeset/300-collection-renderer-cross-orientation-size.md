---
"@ariakit/react-components": patch
---

Fixed [`CollectionRenderer`](https://ariakit.com/reference/collection-renderer), [`CompositeRenderer`](https://ariakit.com/reference/composite-renderer), and [`SelectRenderer`](https://ariakit.com/reference/select-renderer) reserving the wrong amount of space for a nested group whose `orientation` runs perpendicular to the parent, such as a horizontal group inside a vertical list. The group's size is now measured along the parent's axis instead of being summed from the children's cross-axis extents.
