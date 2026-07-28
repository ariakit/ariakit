---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Combobox input value APIs

Added the [`inputValue`](https://ariakit.com/reference/combobox-provider#inputvalue), [`defaultInputValue`](https://ariakit.com/reference/combobox-provider#defaultinputvalue), and [`setInputValue`](https://ariakit.com/reference/combobox-provider#setinputvalue) props, the [`resetInputValue`](https://ariakit.com/reference/use-combobox-store#resetinputvalue) store method, and the [`ComboboxInputValue`](https://ariakit.com/reference/combobox-input-value) component. These APIs distinguish the text in the combobox input from its [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue) state.

```tsx
<ComboboxProvider inputValue={query} setInputValue={setQuery}>
  <Combobox />
  <ComboboxInputValue>
    {(inputValue) => `Current input: ${inputValue}`}
  </ComboboxInputValue>
</ComboboxProvider>
```
