---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

[`#2795`](https://github.com/ariakit/ariakit/pull/2795) Updated the `Menu` component so the `composite` and `typeahead` props are automatically set to `false` when combining it with a `Combobox` component.

This means you'll not need to explicitly pass `composite={false}` when building a [Menu with Combobox](https://ariakit.org/examples/menu-combobox) component.
