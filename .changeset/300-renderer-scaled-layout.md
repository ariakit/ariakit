---
"@ariakit/react-components": patch
---

Fixed overlapping items and active items left out of view after far keyboard moves in virtualized lists inside containers with CSS scaling. This applies to `CollectionRenderer` and all renderers built on it, such as `ComboboxRenderer` and `SelectRenderer`.
