---
"@ariakit/react-components": minor
---

Removed the experimental offscreen item modules

**BREAKING** if you're importing from `@ariakit/react-components/collection/collection-item-offscreen`, `@ariakit/react-components/composite/composite-item-offscreen`, `@ariakit/react-components/combobox/combobox-item-offscreen`, or `@ariakit/react-components/select/select-item-offscreen`, or if you're importing the `getItemRole` helper from `@ariakit/react-components/combobox/combobox-item`.

These experimental modules rendered lightweight placeholders for items outside the scrolling viewport, controlled by the `offscreenMode` and `offscreenRoot` props. They have been removed along with the `data-offscreen`, `data-offscreen-id`, and `data-typeahead-text` attributes they produced, so typeahead no longer collects candidates from those placeholders.

The `getItemRole` helper, which was only exported for these modules, is no longer exported from `@ariakit/react-components/combobox/combobox-item`.

Use the regular [`CollectionItem`](https://ariakit.com/reference/collection-item), [`CompositeItem`](https://ariakit.com/reference/composite-item), [`ComboboxItem`](https://ariakit.com/reference/combobox-item), and [`SelectItem`](https://ariakit.com/reference/select-item) components instead. For long lists, render items through `CollectionRenderer`, `CompositeRenderer`, `ComboboxRenderer`, or `SelectRenderer` to virtualize them.

Before:

```tsx
import { ComboboxItem } from "@ariakit/react-components/combobox/combobox-item-offscreen";

<ComboboxItem value={value} offscreenMode="passive" offscreenRoot={listRef} />;
```

After:

```tsx
import { ComboboxItem } from "@ariakit/react-components/combobox/combobox-item";

<ComboboxItem value={value} />;
```
