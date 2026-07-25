---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

New `resetOnEscape` prop on Combobox popovers

[`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) now supports a [`resetOnEscape`](https://ariakit.com/reference/combobox-popover#resetonescape) prop that restores the value the combobox had before the popover was shown:

```tsx
<ComboboxPopover resetOnEscape={false} />
```

It's enabled by default when [`selectOnMove`](https://ariakit.com/reference/combobox-provider#selectonmove) is enabled, which is when moving through items can change the selected value. The value is only restored when Escape closes the popover, so a descendant that handles the key itself and keeps the popover open leaves it alone.
