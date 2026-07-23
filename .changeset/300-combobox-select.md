---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

New `ComboboxSelect` and `ComboboxSelectLabel` components

The new [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) component renders a select-like button that displays the current [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue) state and controls a [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover). It renders a visually hidden native `<select>` element for form submission and browser autofill, mirroring [`Select`](https://ariakit.com/reference/select). Compose it with a [`Combobox`](https://ariakit.com/reference/combobox) filter inside the same [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider) to build a filterable select.

The new [`ComboboxSelectLabel`](https://ariakit.com/reference/combobox-select-label) component labels the [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) button and moves focus to it when clicked.

The combobox store now also exposes `labelElement` and `selectElement` state along with their `setLabelElement` and `setSelectElement` setters, used by these components.

```jsx
<ComboboxProvider defaultSelectedValue="Apple">
  <ComboboxSelectLabel>Favorite fruit</ComboboxSelectLabel>
  <ComboboxSelect />
  <ComboboxPopover>
    <Combobox autoSelect />
    <ComboboxList>
      <ComboboxItem value="Apple" />
      <ComboboxItem value="Orange" />
    </ComboboxList>
  </ComboboxPopover>
</ComboboxProvider>
```
