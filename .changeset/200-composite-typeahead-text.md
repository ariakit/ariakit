---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Custom typeahead text for composite items

The new [`typeaheadText`](https://ariakit.com/reference/composite-item#typeaheadtext) prop lets [`CompositeItem`](https://ariakit.com/reference/composite-item) use an explicit label for typeahead matching when its rendered content starts with an emoji or other decoration.

```tsx
<SelectItem typeaheadText="Canada" value="Canada">
  <span aria-hidden>🇨🇦</span> Canada
</SelectItem>
```

Set [`typeaheadText`](https://ariakit.com/reference/composite-item#typeaheadtext) to an empty string to exclude an item from typeahead matching. The prop is also available on these components exported by `@ariakit/react` and built on [`CompositeItem`](https://ariakit.com/reference/composite-item): [`ComboboxItem`](https://ariakit.com/reference/combobox-item), [`FormRadio`](https://ariakit.com/reference/form-radio), [`MenuItem`](https://ariakit.com/reference/menu-item), [`MenuItemCheckbox`](https://ariakit.com/reference/menu-item-checkbox), [`MenuItemRadio`](https://ariakit.com/reference/menu-item-radio), [`Radio`](https://ariakit.com/reference/radio), [`SelectItem`](https://ariakit.com/reference/select-item), [`Tab`](https://ariakit.com/reference/tab), [`ToolbarContainer`](https://ariakit.com/reference/toolbar-container), [`ToolbarInput`](https://ariakit.com/reference/toolbar-input), and [`ToolbarItem`](https://ariakit.com/reference/toolbar-item).

Thanks to [@Dremora](https://github.com/Dremora) for reporting the issue and providing the reproduction, and [@georgekaran](https://github.com/georgekaran) for the investigation and implementation work that informed this solution.
