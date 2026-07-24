---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Added `ComboboxSelect` and related components

The Combobox module now supports standard and filterable selects with a single store. `Combobox` is also exported as `ComboboxInput`, while `ComboboxSelectedValue` and `ComboboxItemSelected` expose the selected state for custom rendering:

```tsx
<ComboboxProvider>
  <ComboboxSelectLabel>Favorite fruit</ComboboxSelectLabel>
  <ComboboxSelect />
  <ComboboxPopover>
    <ComboboxInput />
    <ComboboxList>
      <ComboboxItem value="Apple" />
      <ComboboxItem value="Banana" />
    </ComboboxList>
  </ComboboxPopover>
</ComboboxProvider>
```

Thanks to [@georgekaran](https://github.com/georgekaran) for investigating the shared Combobox and Select behavior.
