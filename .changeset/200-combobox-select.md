---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

New `ComboboxSelect` and `ComboboxSelectLabel` components

The new [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) component renders a select-like button that displays the current [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue) state and controls a [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover). It renders a visually hidden native `<select>` element for form submission and browser autofill, mirroring [`Select`](https://ariakit.com/reference/select). Compose it with a [`ComboboxInput`](https://ariakit.com/reference/combobox-input) filter inside the same [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider) to build a filterable select, or render items alone for a standard select where the button keeps DOM focus and drives the listbox with virtual focus, exposing the active item through `aria-activedescendant`.

Like [`Select`](https://ariakit.com/reference/select), the button supports typeahead and the [`showOnKeyDown`](https://ariakit.com/reference/combobox-select#showonkeydown) and [`moveOnKeyDown`](https://ariakit.com/reference/combobox-select#moveonkeydown) props: while the popover is closed, arrow keys and typed characters move the active item and, in a single-select, update the selection like a native select element. While a standard select is open, PageUp and PageDown page through a scrollable listbox, and two-dimensional grids composed with [`ComboboxRow`](https://ariakit.com/reference/combobox-row) can be navigated with arrow keys in both states.

The new [`ComboboxSelectLabel`](https://ariakit.com/reference/combobox-select-label) component labels the [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) button and moves focus to it when clicked.

[`Combobox`](https://ariakit.com/reference/combobox) is now also exported as [`ComboboxInput`](https://ariakit.com/reference/combobox-input) (with `ComboboxInputOptions` and `ComboboxInputProps` type aliases), a clearer name when the input is a filter inside the popover rather than the main combobox element.

The combobox store now also exposes `labelElement`, `selectLabelElement`, and `selectElement` state along with their `setLabelElement`, `setSelectLabelElement`, and `setSelectElement` setters, used by these components.

Other behavior updates that support this feature:

- [`ComboboxItem`](https://ariakit.com/reference/combobox-item) now sets `aria-selected` on items in a single-select combobox when a [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) is registered, conveying the selection to assistive technology as [`SelectItem`](https://ariakit.com/reference/select-item) does. Plain single-select comboboxes without a select button are unchanged.
- [`ComboboxItem`](https://ariakit.com/reference/combobox-item) now moves virtual focus to the hovered item while the popover is open when a [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) is registered, matching [`SelectItem`](https://ariakit.com/reference/select-item). Plain comboboxes keep the previous [`focusOnHover`](https://ariakit.com/reference/combobox-item#focusonhover) default so hovering doesn't disrupt keyboard navigation from the input.
- [`ComboboxLabel`](https://ariakit.com/reference/combobox-label) now registers itself as the store's `labelElement`, and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) is named from the registered label when it has no explicit `aria-label` or [`PopoverHeading`](https://ariakit.com/reference/popover-heading) (the select label takes precedence over the input label). This matches [`SelectPopover`](https://ariakit.com/reference/select-popover), which is already named from [`SelectLabel`](https://ariakit.com/reference/select-label). A standalone [`ComboboxList`](https://ariakit.com/reference/combobox-list) rendered outside the popover is named from the registered labels the same way, matching [`SelectList`](https://ariakit.com/reference/select-list).
- [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) now moves focus into the popover on show when the combobox input is rendered inside it, since nothing outside is holding focus for it. Popovers whose input stays outside keep the previous behavior.
- When a [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) is [`modal`](https://ariakit.com/reference/combobox-popover#modal), the [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) button is now part of the modal context as a persistent element, keeping it focusable and interactive while the popover is open, just like the combobox input.
- [`Combobox`](https://ariakit.com/reference/combobox) now finds its store through scoped contexts as well, so an input rendered inside [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) or [`ComboboxList`](https://ariakit.com/reference/combobox-list) no longer requires an explicit `store` prop.

```tsx
<ComboboxProvider defaultSelectedValue="Apple">
  <ComboboxSelectLabel>Favorite fruit</ComboboxSelectLabel>
  <ComboboxSelect />
  <ComboboxPopover>
    <ComboboxInput autoSelect />
    <ComboboxList>
      <ComboboxItem value="Apple" />
      <ComboboxItem value="Orange" />
    </ComboboxList>
  </ComboboxPopover>
</ComboboxProvider>
```

Thanks to [@cloud-walker](https://github.com/cloud-walker) for reporting the form interoperability gap that motivated this work, and [@georgekaran](https://github.com/georgekaran) for providing the implementation.
