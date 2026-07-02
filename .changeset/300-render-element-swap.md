---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Components re-detect the element when the `render` prop swaps its type

Components that adapt to their underlying HTML element — such as [`Checkbox`](https://ariakit.com/reference/checkbox), [`Radio`](https://ariakit.com/reference/radio), [`Button`](https://ariakit.com/reference/button), [`Command`](https://ariakit.com/reference/command), [`Focusable`](https://ariakit.com/reference/focusable), [`Form`](https://ariakit.com/reference/form), [`Heading`](https://ariakit.com/reference/heading), [`ComboboxList`](https://ariakit.com/reference/combobox-list), and everything built on them — used to detect the element only once on mount. Swapping the element type through [composition](https://ariakit.com/guide/composition) while the component stayed mounted kept props computed for the previous element. For example, a [`Checkbox`](https://ariakit.com/reference/checkbox) swapped from `<input />` to `<div />` would lose its `role="checkbox"`, keep a stale `type` attribute, and stop toggling on click:

```tsx
<Checkbox
  checked={checked}
  onChange={() => setChecked(!checked)}
  render={custom ? <div /> : <input />}
/>
```

The element is now re-detected whenever it changes, so the components above apply the correct role, attributes, tab index, and event behavior after the swap.
