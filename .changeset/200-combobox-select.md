---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Added Combobox select components

Added [`ComboboxSelect`](https://ariakit.com/reference/combobox-select), [`ComboboxSelectLabel`](https://ariakit.com/reference/combobox-select-label), [`ComboboxSelectArrow`](https://ariakit.com/reference/combobox-select-arrow), [`ComboboxInput`](https://ariakit.com/reference/combobox-input), [`ComboboxSelectedValue`](https://ariakit.com/reference/combobox-selected-value), [`ComboboxItemSelected`](https://ariakit.com/reference/combobox-item-selected), [`ComboboxDismiss`](https://ariakit.com/reference/combobox-dismiss), and [`ComboboxHeading`](https://ariakit.com/reference/combobox-heading). Together, these APIs support standard and filterable selects with one Combobox store:

```tsx
<ComboboxProvider>
  <ComboboxSelectLabel>Favorite fruit</ComboboxSelectLabel>
  <ComboboxSelect />
  <ComboboxPopover>
    <ComboboxLabel>Search fruits</ComboboxLabel>
    <ComboboxInput />
    <ComboboxList>
      <ComboboxItem value="Apple" />
      <ComboboxItem value="Banana" />
    </ComboboxList>
  </ComboboxPopover>
</ComboboxProvider>
```

Thanks to [@georgekaran](https://github.com/georgekaran) for investigating the shared Combobox and Select behavior.
