---
"@ariakit/react-components": patch
---

Fixed `CompositeRenderer` leaving the active item out of view after a keyboard move to a far item, or after a popup opened with a far selected item, when the items have different sizes and the renderer has no `itemSize`. Nested lists keep the item in view on each axis when rows scroll their own cells. This applies to all renderers built on `CompositeRenderer`, such as `ComboboxRenderer` and `SelectRenderer`.
