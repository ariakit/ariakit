---
"@ariakit/react-components": patch
---

Fixed `CompositeRenderer` leaving the active item out of view after a far keyboard move when the list uses smooth scrolling, its items have different sizes, and the renderer has no `itemSize`. This applies to all renderers built on `CompositeRenderer`, such as `ComboboxRenderer` and `SelectRenderer`.
