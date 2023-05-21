---
"@ariakit/react-core": patch
"@ariakit/core": patch
"@ariakit/react": patch
---

Updated the `SelectPopover` component so the `composite` and `typeahead` props are automatically set to `false` when combining it with a `Combobox` component using the `combobox` prop from the select store. ([#2428](https://github.com/ariakit/ariakit/pull/2428))

This means you'll not need to explicitly pass `composite={false}` when building a [Select with Combobox](https://ariakit.org/examples/select-combobox) component.
