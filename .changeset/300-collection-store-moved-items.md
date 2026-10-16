---
"@ariakit/components": patch
---

Fixed collection stores keeping the previous order of `renderedItems` when item elements move in the DOM without registering again. This applies to all stores built on the collection store, such as the composite, combobox, and select stores.
