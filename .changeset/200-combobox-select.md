---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

New Combobox Select components

Added [`ComboboxSelect`](https://ariakit.com/reference/combobox-select), [`ComboboxSelectLabel`](https://ariakit.com/reference/combobox-select-label), [`ComboboxSelectArrow`](https://ariakit.com/reference/combobox-select-arrow), [`ComboboxInput`](https://ariakit.com/reference/combobox-input), [`ComboboxSelectedValue`](https://ariakit.com/reference/combobox-selected-value), [`ComboboxItemSelected`](https://ariakit.com/reference/combobox-item-selected), [`ComboboxDismiss`](https://ariakit.com/reference/combobox-dismiss), and [`ComboboxHeading`](https://ariakit.com/reference/combobox-heading). Together, these APIs let standard and filterable selects use one Combobox store:

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

For filterable selects, the Combobox store now distinguishes the text in the input from its [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue) state. Use [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue), [`defaultInputValue`](https://ariakit.com/reference/combobox-provider#defaultinputvalue), and [`setInputValue`](https://ariakit.com/reference/combobox-provider#setinputvalue) to control this text, [`resetInputValue`](https://ariakit.com/reference/use-combobox-store#resetinputvalue) to restore its initial value, and [`ComboboxInputValue`](https://ariakit.com/reference/combobox-input-value) to read it from the component tree.

The Combobox store also gained the [`selectOnMove`](https://ariakit.com/reference/combobox-provider#selectonmove) option, which selects the active item while moving through the list with the popover open. It now exposes the `inputElement`, `labelElement`, `selectElement`, and `selectLabelElement` state, along with their respective setters.

To make keyboard selection previews easy to cancel, [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) now supports a [`resetOnEscape`](https://ariakit.com/reference/combobox-popover#resetonescape) prop. It defaults to [`selectOnMove`](https://ariakit.com/reference/combobox-provider#selectonmove) and restores the selected value captured before the first item movement when the popover accepts Escape and its cancelable close event isn't prevented. Selection changes made before any item movement become part of the value Escape restores.

Filterable selects built with these APIs are also more efficient. In a 243-option benchmark, restoring the full list after clearing the filter with one Combobox store reduced scripting time by 50% and total time by 43% compared with separate Select and Combobox stores.

Thanks to [@lessp](https://github.com/lessp) for reporting the performance issue, [@patrikholcak](https://github.com/patrikholcak) for investigating it, and [@georgekaran](https://github.com/georgekaran) for providing the workaround and investigating the shared Combobox and Select behavior.
