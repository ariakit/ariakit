---
"ariakit": minor
---

Improved support for `CompositeItem` rendered as a link. This includes `ComboboxItem`, `MenuItem`, and `SelectItem` components. Now clicking on `<a>` items with a mouse or keyboard while pressing `metaKey` (macOS) or `ctrlKey` (PC) opens the link in a new tab as expected. Popovers won't close and `Select`/`Combobox` values won't change when clicking with those modifiers. ([#1736](https://github.com/ariakit/ariakit/pull/1736))
