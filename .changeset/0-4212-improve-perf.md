---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Improved performance on composite widgets

Composite item components such as [`ComboboxItem`](https://ariakit.org/reference/combobox-item) and [`SelectItem`](https://ariakit.org/reference/select-item) now render 20-30% faster compared to Ariakit v0.4.13.

This enhancement should decrease the time needed to render large collections of items in composite widgets and improve the Interaction to Next Paint (INP) metric. We're working on further optimizations to make composite widgets even faster in future releases.
