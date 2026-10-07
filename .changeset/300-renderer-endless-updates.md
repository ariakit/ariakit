---
"@ariakit/react-components": patch
---

Fixed `CollectionRenderer` updating without end after it measures items of some sizes, such as sizes with a fraction of a pixel, when it has no `itemSize`. This applies to all renderers built on `CollectionRenderer`, such as `ComboboxRenderer` and `SelectRenderer`.
