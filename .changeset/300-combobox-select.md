---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

New `ComboboxSelect` and `ComboboxSelectLabel` components

The new [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) component renders a select-like button that displays the current [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue) state and controls a [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover). It renders a visually hidden native `<select>` element for form submission and browser autofill, mirroring [`Select`](https://ariakit.com/reference/select). Compose it with a [`Combobox`](https://ariakit.com/reference/combobox) filter inside the same [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider) to build a filterable select.

The new [`ComboboxSelectLabel`](https://ariakit.com/reference/combobox-select-label) component labels the [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) button and moves focus to it when clicked.

The combobox store now also exposes `labelElement`, `selectLabelElement`, and `selectElement` state along with their `setLabelElement`, `setSelectLabelElement`, and `setSelectElement` setters, used by these components.

[`ComboboxLabel`](https://ariakit.com/reference/combobox-label) now registers itself as the store's `labelElement`, and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) is named from the registered label when it has no explicit `aria-label` or [`PopoverHeading`](https://ariakit.com/reference/popover-heading) (the select label takes precedence over the input label). This matches [`SelectPopover`](https://ariakit.com/reference/select-popover), which is already named from [`SelectLabel`](https://ariakit.com/reference/select-label).

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
